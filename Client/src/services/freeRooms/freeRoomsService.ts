import { axiosInstance } from "../api";

export const fetchFreeRooms = async (
  universityUuid: string,
  startTime: Date,
  endTime: Date,
) => {
  try {
    const requestBody = {
      start_time: startTime,
      end_time: endTime,
    };

    const response = await axiosInstance.get(
      `/calendar/rooms/free/${universityUuid}`,
      {
        params: requestBody,
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching free rooms:", error);
    throw error;
  }
};
