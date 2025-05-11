// toastStyles.ts
import { StyleSheet } from 'react-native';

export const HEIGHT = 60;
export const WIDTH = 340;
export const BORDER_RADIUS = 6;

// Dark Theme Toast Styles
export const darkToastErrorStyle = StyleSheet.create({
  base: {
    flexDirection: 'row',
    height: HEIGHT,
    width: WIDTH,
    borderRadius: BORDER_RADIUS,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: BORDER_RADIUS,
    elevation: 2,
    backgroundColor: '#333',
  },
  leadingBorder: {
    borderLeftWidth: 5,
    borderLeftColor: '#CB4E01',
  },
  contentContainer: {
    paddingHorizontal: 25,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  text1: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
    color: '#FFF',
    width: '100%',
  },
  text2: {
    fontSize: 10,
    color: '#ccc',
    width: '100%',
  },
});

export const darkToastSuccessStyle = StyleSheet.create({
    base: {
      flexDirection: 'row',
      height: HEIGHT,
      width: WIDTH,
      borderRadius: BORDER_RADIUS,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.1,
      shadowRadius: BORDER_RADIUS,
      elevation: 2,
      backgroundColor: '#333'
    },
    leadingBorder: {
      borderLeftWidth: 5,
      borderLeftColor: '#42B355'
    },
    contentContainer: {
      paddingHorizontal: 25,
      flex: 1,
      justifyContent: 'center',
      alignItems: 'flex-start'
    },
    text1: {
      fontSize: 12,
      fontWeight: 'bold',
      marginBottom: 2,
      color: '#FFF',
      width: '100%' 
    },
    text2: {
      fontSize: 10,
      color: '#ccc',
      width: '100%'
    }
  });

  export const darkToastInfoStyle = StyleSheet.create({
    base: {
      flexDirection: 'row',
      height: HEIGHT,
      width: WIDTH,
      borderRadius: BORDER_RADIUS,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.1,
      shadowRadius: BORDER_RADIUS,
      elevation: 2,
      backgroundColor: '#333'
    },
    leadingBorder: {
      borderLeftWidth: 5,
      borderLeftColor: '#4FB7F8'
    },
    contentContainer: {
      paddingHorizontal: 25,
      flex: 1,
      justifyContent: 'center',
      alignItems: 'flex-start' // In case of RTL, the text will start from the right
    },
    text1: {
      fontSize: 12,
      fontWeight: 'bold',
      marginBottom: 2,
      color: '#FFF',
      width: '100%' // Fixes: https://github.com/calintamas/react-native-toast-message/issues/130
    },
    text2: {
      fontSize: 10,
      color: '#ccc',
      width: '100%' // Fixes: https://github.com/calintamas/react-native-toast-message/issues/130
    }
  });

  export const darkToastWarningStyle = StyleSheet.create({
    base: {
      flexDirection: 'row',
      height: HEIGHT,
      width: WIDTH,
      borderRadius: BORDER_RADIUS,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.1,
      shadowRadius: BORDER_RADIUS,
      elevation: 2,
      backgroundColor: '#333'
    },
    leadingBorder: {
      borderLeftWidth: 5,
      borderLeftColor: '#B29506'
    },
    contentContainer: {
      paddingHorizontal: 25,
      flex: 1,
      justifyContent: 'center',
      alignItems: 'flex-start' // In case of RTL, the text will start from the right
    },
    text1: {
      fontSize: 12,
      fontWeight: 'bold',
      marginBottom: 2,
      color: '#FFF',
      width: '100%' // Fixes: https://github.com/calintamas/react-native-toast-message/issues/130
    },
    text2: {
      fontSize: 10,
      color: '#ccc',
      width: '100%' // Fixes: https://github.com/calintamas/react-native-toast-message/issues/130
    }
  });

  export const lightToastErrorStyle = StyleSheet.create({
    base: {
      flexDirection: 'row',
      height: HEIGHT,
      width: WIDTH,
      borderRadius: BORDER_RADIUS,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.1,
      shadowRadius: BORDER_RADIUS,
      elevation: 2,
      backgroundColor: '#FFF'
    },
    leadingBorder: {
      borderLeftWidth: 5,
      borderLeftColor: '#FE6301'
    },
    contentContainer: {
      paddingHorizontal: 25,
      flex: 1,
      justifyContent: 'center',
      alignItems: 'flex-start' // In case of RTL, the text will start from the right
    },
    text1: {
      fontSize: 12,
      fontWeight: 'bold',
      marginBottom: 2,
      color: '#000',
      width: '100%' // Fixes: https://github.com/calintamas/react-native-toast-message/issues/130
    },
    text2: {
      fontSize: 10,
      color: '#979797',
      width: '100%' // Fixes: https://github.com/calintamas/react-native-toast-message/issues/130
    }
  });

  export const lightToastSuccessStyle = StyleSheet.create({
    base: {
      flexDirection: 'row',
      height: HEIGHT,
      width: WIDTH,
      borderRadius: BORDER_RADIUS,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.1,
      shadowRadius: BORDER_RADIUS,
      elevation: 2,
      backgroundColor: '#FFF'
    },
    leadingBorder: {
      borderLeftWidth: 5,
      borderLeftColor: '#69C779'
    },
    contentContainer: {
      paddingHorizontal: 25,
      flex: 1,
      justifyContent: 'center',
      alignItems: 'flex-start' // In case of RTL, the text will start from the right
    },
    text1: {
      fontSize: 12,
      fontWeight: 'bold',
      marginBottom: 2,
      color: '#000',
      width: '100%' // Fixes: https://github.com/calintamas/react-native-toast-message/issues/130
    },
    text2: {
      fontSize: 10,
      color: '#979797',
      width: '100%' // Fixes: https://github.com/calintamas/react-native-toast-message/issues/130
    }
  });

  export const lightToastInfoStyle = StyleSheet.create({
    base: {
      flexDirection: 'row',
      height: HEIGHT,
      width: WIDTH,
      borderRadius: BORDER_RADIUS,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.1,
      shadowRadius: BORDER_RADIUS,
      elevation: 2,
      backgroundColor: '#FFF'
    },
    leadingBorder: {
      borderLeftWidth: 5,
      borderLeftColor: '#87CEFA'
    },
    contentContainer: {
      paddingHorizontal: 25,
      flex: 1,
      justifyContent: 'center',
      alignItems: 'flex-start' // In case of RTL, the text will start from the right
    },
    text1: {
      fontSize: 12,
      fontWeight: 'bold',
      marginBottom: 2,
      color: '#000',
      width: '100%' // Fixes: https://github.com/calintamas/react-native-toast-message/issues/130
    },
    text2: {
      fontSize: 10,
      color: '#979797',
      width: '100%' // Fixes: https://github.com/calintamas/react-native-toast-message/issues/130
    }
  });

  export const lightToastWarningStyle = StyleSheet.create({
    base: {
      flexDirection: 'row',
      height: HEIGHT,
      width: WIDTH,
      borderRadius: BORDER_RADIUS,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.1,
      shadowRadius: BORDER_RADIUS,
      elevation: 2,
      backgroundColor: '#FFF'
    },
    leadingBorder: {
      borderLeftWidth: 5,
      borderLeftColor: '#EFCA08'
    },
    contentContainer: {
      paddingHorizontal: 25,
      flex: 1,
      justifyContent: 'center',
      alignItems: 'flex-start' // In case of RTL, the text will start from the right
    },
    text1: {
      fontSize: 12,
      fontWeight: 'bold',
      marginBottom: 2,
      color: '#000',
      width: '100%' // Fixes: https://github.com/calintamas/react-native-toast-message/issues/130
    },
    text2: {
      fontSize: 10,
      color: '#979797',
      width: '100%' // Fixes: https://github.com/calintamas/react-native-toast-message/issues/130
    }
  });