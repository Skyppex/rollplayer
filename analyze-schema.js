#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

function analyzeValue(value, depth = 0) {
  if (value === null) return { type: "null" };
  if (value === undefined) return { type: "undefined" };

  if (Array.isArray(value)) {
    if (value.length === 0)
      return {
        type: "array",
        elementTypes: { type: "unknown", reason: "empty_array" },
      };

    // Analyze all array elements
    const elementSchemas = value.map((item) => analyzeValue(item, depth + 1));
    const mergedElements = mergeArrayElements(elementSchemas);

    return {
      type: "array",
      elementTypes: mergedElements,
    };
  }

  if (typeof value === "object") {
    const properties = {};
    for (const [key, val] of Object.entries(value)) {
      properties[key] = analyzeValue(val, depth + 1);
    }
    return {
      type: "object",
      properties,
    };
  }

  return { type: typeof value };
}

function mergeArrayElements(schemas) {
  if (schemas.length === 0) return { type: "unknown" };
  if (schemas.length === 1) return schemas[0];

  // Filter out unknown types from empty arrays if we have real types
  const nonUnknownSchemas = schemas.filter((s) => s.type !== "unknown");
  const unknownSchemas = schemas.filter((s) => s.type === "unknown");

  // If we have non-unknown types, ignore the unknown ones (they're probably empty arrays)
  const schemasToUse =
    nonUnknownSchemas.length > 0 ? nonUnknownSchemas : schemas;

  // Group by type
  const typeGroups = {};

  for (const schema of schemasToUse) {
    const key = schema.type;
    if (!typeGroups[key]) {
      typeGroups[key] = [];
    }
    typeGroups[key].push(schema);
  }

  // Merge within each type group
  const mergedTypes = [];
  for (const [type, group] of Object.entries(typeGroups)) {
    if (type === "object") {
      // Merge all object schemas
      const mergedObject = { type: "object", properties: {} };
      for (const obj of group) {
        for (const [key, value] of Object.entries(obj.properties || {})) {
          if (mergedObject.properties[key]) {
            mergedObject.properties[key] = mergeSchemas(
              mergedObject.properties[key],
              value,
            );
          } else {
            mergedObject.properties[key] = value;
          }
        }
      }
      mergedTypes.push(mergedObject);
    } else {
      // For primitives, just take the first one
      mergedTypes.push(group[0]);
    }
  }

  return mergedTypes.length === 1
    ? mergedTypes[0]
    : { unionTypes: mergedTypes };
}

function mergeSchemas(schema1, schema2) {
  if (schema1.type !== schema2.type) {
    // Special case: if one is array with unknown elements and other is array with known elements
    if (schema1.type === "array" && schema2.type === "array") {
      if (
        schema1.elementTypes?.type === "unknown" &&
        schema2.elementTypes?.type !== "unknown"
      ) {
        return schema2;
      }
      if (
        schema2.elementTypes?.type === "unknown" &&
        schema1.elementTypes?.type !== "unknown"
      ) {
        return schema1;
      }
    }

    // Different types - create union
    const types1 = schema1.unionTypes || [schema1];
    const types2 = schema2.unionTypes || [schema2];

    const mergedUnion = [];
    const seenTypes = new Set();

    for (const type of [...types1, ...types2]) {
      if (!seenTypes.has(type.type)) {
        seenTypes.add(type.type);
        mergedUnion.push(type);
      } else if (type.type === "object") {
        // Merge with existing object type
        const existing = mergedUnion.find((t) => t.type === "object");
        if (existing) {
          for (const [key, value] of Object.entries(type.properties || {})) {
            if (existing.properties[key]) {
              existing.properties[key] = mergeSchemas(
                existing.properties[key],
                value,
              );
            } else {
              existing.properties[key] = value;
            }
          }
        }
      } else if (type.type === "array") {
        // Merge with existing array type
        const existing = mergedUnion.find((t) => t.type === "array");
        if (existing) {
          existing.elementTypes = mergeSchemas(
            existing.elementTypes,
            type.elementTypes,
          );
        }
      }
    }

    return mergedUnion.length === 1
      ? mergedUnion[0]
      : { unionTypes: mergedUnion };
  }

  if (schema1.type === "object") {
    const merged = { type: "object", properties: {} };
    const allKeys = new Set([
      ...Object.keys(schema1.properties || {}),
      ...Object.keys(schema2.properties || {}),
    ]);

    for (const key of allKeys) {
      const prop1 = schema1.properties?.[key];
      const prop2 = schema2.properties?.[key];

      if (prop1 && prop2) {
        merged.properties[key] = mergeSchemas(prop1, prop2);
      } else {
        merged.properties[key] = prop1 || prop2;
      }
    }
    return merged;
  }

  if (schema1.type === "array") {
    return {
      type: "array",
      elementTypes: mergeSchemas(schema1.elementTypes, schema2.elementTypes),
    };
  }

  return schema1; // Same primitive type
}

function generateTypeScript(
  schema,
  interfaceName,
  generatedInterfaces = new Set(),
  inline = false,
  depth = 0,
) {
  if (schema.unionTypes) {
    return schema.unionTypes
      .map((type) =>
        generateTypeScript(
          type,
          interfaceName,
          generatedInterfaces,
          inline,
          depth,
        ),
      )
      .join(" | ");
  }

  switch (schema.type) {
    case "string":
    case "number":
    case "boolean":
    case "null":
    case "undefined":
      return schema.type;

    case "literal_union":
      return schema.value;

    case "array":
      const elementType = generateTypeScript(
        schema.elementTypes,
        `${interfaceName}Element`,
        generatedInterfaces,
        inline,
        depth,
      );
      if (elementType === "unknown") {
        return "[unknown]";
      }
      return `[${elementType}]`;

    case "object":
      if (!schema.properties || Object.keys(schema.properties).length === 0) {
        return "Record<string, unknown>";
      }

      if (inline) {
        // No depth limit for inline mode
        const indent = "  ".repeat(depth + 1);
        const closeIndent = "  ".repeat(depth);
        const props = [];
        for (const [key, value] of Object.entries(schema.properties)) {
          const safeKey =
            key.includes("-") || key.includes(" ") || key.match(/^\d/)
              ? `"${key}"`
              : key;
          const hasUndefined =
            value.unionTypes?.some((t) => t.type === "undefined") ||
            value.type === "undefined";
          const optional = hasUndefined ? "?" : "";
          const typeStr = generateTypeScript(
            value,
            `${interfaceName}${key.charAt(0).toUpperCase() + key.slice(1)}`,
            generatedInterfaces,
            inline,
            depth + 1,
          );
          props.push(`${indent}${safeKey}${optional}: ${typeStr}`);
        }
        return `{\n${props.join(";\n")};\n${closeIndent}}`;
      }

      return interfaceName;

    default:
      return "unknown";
  }
}

function generateInterface(
  schema,
  interfaceName,
  generatedInterfaces = new Set(),
) {
  if (generatedInterfaces.has(interfaceName)) return "";
  if (schema.type !== "object" || !schema.properties) return "";

  generatedInterfaces.add(interfaceName);

  let result = `interface ${interfaceName} {\n`;

  for (const [key, value] of Object.entries(schema.properties)) {
    const safeKey =
      key.includes("-") || key.includes(" ") || key.match(/^\d/)
        ? `"${key}"`
        : key;
    const nestedInterfaceName = `${interfaceName}${key.charAt(0).toUpperCase() + key.slice(1).replace(/[^a-zA-Z0-9]/g, "")}`;

    const hasUndefined =
      value.unionTypes?.some((t) => t.type === "undefined") ||
      value.type === "undefined";
    const optional = hasUndefined ? "?" : "";

    const typeStr = generateTypeScript(
      value,
      nestedInterfaceName,
      generatedInterfaces,
      false,
      0,
    );
    result += `  ${safeKey}${optional}: ${typeStr};\n`;
  }

  result += `}\n\n`;

  // Generate nested interfaces
  for (const [key, value] of Object.entries(schema.properties)) {
    const nestedInterfaceName = `${interfaceName}${key.charAt(0).toUpperCase() + key.slice(1).replace(/[^a-zA-Z0-9]/g, "")}`;
    result += generateInterface(
      value,
      nestedInterfaceName,
      generatedInterfaces,
    );

    if (value.type === "array" && value.elementTypes) {
      const elementInterfaceName = `${nestedInterfaceName}Element`;
      result += generateInterface(
        value.elementTypes,
        elementInterfaceName,
        generatedInterfaces,
      );
    }
  }

  return result;
}

function analyzeFile(filename) {
  console.log(`Analyzing: ${filename}\n`);

  try {
    const data = JSON.parse(fs.readFileSync(filename, "utf8"));

    if (!Array.isArray(data)) {
      console.log("❌ File is not an array");
      return;
    }

    if (data.length === 0) {
      console.log("❌ Array is empty");
      return;
    }

    console.log(`📊 Found ${data.length} items\n`);

    // Collect ALL unique values for ANY "type" field
    const allTypeValues = new Set();

    function collectAllTypeValues(obj) {
      if (typeof obj !== "object" || obj === null) return;

      for (const [key, value] of Object.entries(obj)) {
        if (key === "type" && typeof value === "string") {
          allTypeValues.add(value);
        } else if (Array.isArray(value)) {
          value.forEach((item) => collectAllTypeValues(item));
        } else if (typeof value === "object" && value !== null) {
          collectAllTypeValues(value);
        }
      }
    }

    for (const item of data) {
      collectAllTypeValues(item);
    }

    // Analyze all items
    let mergedSchema = { type: "object", properties: {} };

    for (const item of data) {
      const itemSchema = analyzeValue(item);
      mergedSchema = mergeSchemas(mergedSchema, itemSchema);
    }

    // Create type union from all collected values
    const typeUnion =
      allTypeValues.size > 0
        ? Array.from(allTypeValues)
            .map((val) => `"${val}"`)
            .join(" | ")
        : null;

    // Debug: console.log(`Found type values: [${Array.from(allTypeValues).join(', ')}]`);

    // Simple recursive function to replace ALL "type" fields that are strings
    function replaceTypeFields(obj) {
      if (!obj || typeof obj !== "object") return;

      // Handle the object itself
      if (obj.properties) {
        for (const [key, value] of Object.entries(obj.properties)) {
          if (key === "type" && value.type === "string" && typeUnion) {
            obj.properties[key] = { type: "literal_union", value: typeUnion };
            // console.log(`✅ Replaced type field with union`);
          }
        }
      }

      // Recursively process all values
      for (const value of Object.values(obj)) {
        if (Array.isArray(value)) {
          value.forEach(replaceTypeFields);
        } else if (value && typeof value === "object") {
          replaceTypeFields(value);
        }
      }
    }

    replaceTypeFields(mergedSchema);

    // Clean up unions that contain unknown alongside other types
    function cleanUnknownUnions(obj) {
      if (!obj || typeof obj !== "object") return;

      // Handle union types
      if (obj.unionTypes && Array.isArray(obj.unionTypes)) {
        const nonUnknownTypes = obj.unionTypes.filter(t => t.type !== "unknown");
        const hasUnknown = obj.unionTypes.some(t => t.type === "unknown");

        // If we have both unknown and other types, remove unknown
        if (hasUnknown && nonUnknownTypes.length > 0) {
          // console.log(`Found union with unknown: [${obj.unionTypes.map(t => t.type).join(', ')}] -> [${nonUnknownTypes.map(t => t.type).join(', ')}]`);
          if (nonUnknownTypes.length === 1) {
            // Replace union with single type - properly copy all properties
            const singleType = nonUnknownTypes[0];
            delete obj.unionTypes;
            obj.type = singleType.type;
            if (singleType.properties) obj.properties = singleType.properties;
            if (singleType.elementTypes) obj.elementTypes = singleType.elementTypes;
          } else {
            // Keep union but without unknown
            obj.unionTypes = nonUnknownTypes;
          }
        }
      }

      // Handle array element types that might have unions
      if (obj.type === "array" && obj.elementTypes) {
        cleanUnknownUnions(obj.elementTypes);
      }

      // Handle object properties
      if (obj.properties) {
        for (const value of Object.values(obj.properties)) {
          cleanUnknownUnions(value);
        }
      }

      // Recursively process all other values
      for (const value of Object.values(obj)) {
        if (Array.isArray(value)) {
          value.forEach(cleanUnknownUnions);
        } else if (value && typeof value === "object") {
          cleanUnknownUnions(value);
        }
      }
    }

    cleanUnknownUnions(mergedSchema);

    // Debug: Check specific field after cleanup
    // const fAbilityField = mergedSchema.properties?._fAbility;
    // if (fAbilityField) {
    //   console.log('_fAbility field after cleanup:', JSON.stringify(fAbilityField, null, 2));
    // }

    // Generate interface name
    const baseName = path
      .basename(filename, ".json")
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("")
      .replace(/[^a-zA-Z0-9]/g, "");

    console.log("TypeScript Interface:");
    console.log("=".repeat(50));

    // Check if inline flag is passed
    const useInline = process.argv.includes("--inline");

    if (useInline) {
      // Generate inline type
      const inlineType = generateTypeScript(
        mergedSchema,
        baseName,
        new Set(),
        true,
        0,
      );
      console.log(`type ${baseName} = ${inlineType};\n`);
    } else {
      console.log(generateInterface(mergedSchema, baseName));
    }
  } catch (error) {
    console.error(`❌ Error analyzing ${filename}:`, error.message);
  }
}

// Main execution
const filename = process.argv[2];

if (!filename) {
  console.log("Usage: node analyze-schema.js <filename.json> [--inline]");
  console.log("  --inline: Generate inline object types instead of interfaces");
  console.log("\nAvailable files:");
  const jsonFiles = fs
    .readdirSync(".")
    .filter((file) => file.endsWith(".json"))
    .filter((file) => !file.includes("package"))
    .filter((file) => !file.includes("lock"));

  jsonFiles.forEach((file) => console.log(`  - ${file}`));
  process.exit(1);
}

if (!fs.existsSync(filename)) {
  console.error(`❌ File '${filename}' does not exist`);
  process.exit(1);
}

analyzeFile(filename);

