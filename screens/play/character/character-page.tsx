import { Slider } from "@react-native-assets/slider";
import React, { useState } from "react";
import { View, Text } from "react-native";
import tw from 'twrnc';

export default function CharacterPage() {
    return <div style={tw`flex-1 justify-center items-center`}>
        <Health></Health>
    </div>
}

function Health() {
    let [health, setHealth] = useState<number>();
    let [maxHealth, setMaxHealth] = useState<number>(10);

    return <View style={tw`flex-1 ml-4 mr-4 mt-2`}>
        <Text style={tw`flex-1 font-semibold text-xl`}>Health</Text>
        <Text style={tw`flex-1 items-center text-xs`}>HIT POINTS</Text>
        <Slider style={tw`flex-1`}
            value={health}
            onValueChange={v => setHealth(v)}
            step={1}
            minimumValue={0}
            maximumValue={maxHealth}></Slider>
    </View>
}