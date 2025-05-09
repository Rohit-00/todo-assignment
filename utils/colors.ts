import { Appearance } from "react-native";
const theme = {
    dark: {
        text: '#ffffff',
        secondText:'#3D3D3D',
        background: '#121212',
        secondBackground: '#1A1A1A',
        primary: '#00C896',
        border: '#5E5E5E',
        skeletonBackground: '#1A1A1A',
        skeletonHighlight: '#333333',
        input:'white',
        buttonBackground:'#EEEEEE',
        negative:'#D85A32'
    },
    light: {
        input:'white',
        text: '#000000',
        secondText:'#3D3D3D',
        secondBackground:'#F7F7F7',
        background: '#F6FAFB',
        primary: '#00C896',
        border: '#E9E9E9',
        skeletongBackground: '#F7F7F7',
        skeletonHighlight: '#E0E0E0',
        buttonBackground:'#EEEEEE',
        negative:'#D85A32'


    }
  };

const isDarkMode = Appearance.getColorScheme() === 'dark';
export const colors = theme['light'];