import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CharacterPage from './screens/play/character/character-page';
import StatsPage from './screens/play/stats/stats-page';
import ClassPage from './screens/play/class/class-page';
import InventoryPage from './screens/play/inventory/inventory-page';
import InfoPage from './screens/play/info/info-page';

// import Ionicons from '@expo/vector-icons/Ionicons';

const Tab = createBottomTabNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <Tab.Navigator screenOptions={{
                tabBarShowLabel: false,
                tabBarActiveTintColor: "magenta",
                headerShown: false,
            }}>
                <Tab.Screen name='Character' component={CharacterPage}>
                </Tab.Screen>
                <Tab.Screen name='Stats' component={StatsPage}>
                </Tab.Screen>
                <Tab.Screen name='Class' component={ClassPage}>
                </Tab.Screen>
                <Tab.Screen name='Inventory' component={InventoryPage}>
                </Tab.Screen>
                <Tab.Screen name='Info' component={InfoPage}>
                </Tab.Screen>
            </Tab.Navigator>
        </NavigationContainer>
    );
}
