import { StatusBar } from "expo-status-bar";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { I18nProvider } from "./src/i18n";
import DashboardScreen from "./src/screens/DashboardScreen";
import { ThemeProvider, useTheme } from "./src/theme";

function Shell() {
  const { colors, mode } = useTheme();
  return (
    <View style={[styles.bg, { backgroundColor: colors.bg }]}>
      <SafeAreaView style={styles.safe}>
        <DashboardScreen />
      </SafeAreaView>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
    </View>
  );
}

export default function App() {
  return (
    <ThemeProvider initial="dark">
      <I18nProvider>
        <Shell />
      </I18nProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1 },
});
