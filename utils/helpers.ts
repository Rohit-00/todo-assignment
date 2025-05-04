import { colors } from "./colors";

  export const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#FF4B4B';
      case 'medium':
        return '#FFA246';
      case 'low':
        return '#4CAF50';
      default:
        return colors.secondText;
    }
  };