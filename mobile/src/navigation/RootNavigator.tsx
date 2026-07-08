import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import { LoginScreen } from "../screens/LoginScreen";
import { SignupScreen } from "../screens/SignupScreen";
import { PetListScreen } from "../screens/PetListScreen";
import { AddPetScreen } from "../screens/AddPetScreen";
import { ChatScreen } from "../screens/ChatScreen";
import { SubscribeScreen } from "../screens/SubscribeScreen";
import { AccountScreen } from "../screens/AccountScreen";
import { FindVetScreen } from "../screens/FindVetScreen";
import { colors } from "../theme";

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

export type AppStackParamList = {
  PetList: undefined;
  AddPet: undefined;
  Chat: { petId: string; petName: string };
  Subscribe: undefined;
  Account: undefined;
  FindVet: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
    </AuthStack.Navigator>
  );
}

function AppNavigator() {
  return (
    <AppStack.Navigator
      screenOptions={{
        headerTintColor: colors.primary,
        headerStyle: { backgroundColor: colors.background },
      }}
    >
      <AppStack.Screen name="PetList" component={PetListScreen} options={{ title: "Pet Plus" }} />
      <AppStack.Screen name="AddPet" component={AddPetScreen} options={{ title: "Add a pet" }} />
      <AppStack.Screen name="Chat" component={ChatScreen} />
      <AppStack.Screen
        name="Subscribe"
        component={SubscribeScreen}
        options={{ title: "Subscribe" }}
      />
      <AppStack.Screen name="Account" component={AccountScreen} options={{ title: "Account" }} />
      <AppStack.Screen
        name="FindVet"
        component={FindVetScreen}
        options={{ title: "Find a vet" }}
      />
    </AppStack.Navigator>
  );
}

export function RootNavigator() {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return <NavigationContainer>{token ? <AppNavigator /> : <AuthNavigator />}</NavigationContainer>;
}
