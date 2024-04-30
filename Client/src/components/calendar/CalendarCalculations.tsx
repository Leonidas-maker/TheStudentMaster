// ====================================================== //
// ===================== Interfaces ===================== //
// ====================================================== //

export interface CalculationEventHeightProps {
  start: Date;
  end: Date;
  startHour: number;
  endHour: number;
  hoursContainerHeight: number;
}

export interface CalculationTopPositionProps {
  start: Date;
  startHour: number;
  endHour: number;
  hoursContainerHeight: number;
  containerHeight: number;
}

export interface CalculationLeftPositionProps {
  overlapCount: number;
  overlapIndex: number;
}

export interface CalculationMarkerPositionProps {
  startHour: number;
  endHour: number;
  hoursContainerHeight: number;
  containerHeight: number;
}

// ====================================================== //
// ================== Helper functions ================== //
// ====================================================== //

// Event start calculation in hours minus the start hour of the calender
export const calculateEventStart = (start: Date, startHour: number) => {
  return start.getHours() + start.getMinutes() / 60 - startHour;
};

// Event end calculation in hours minus the start hour of the calender
export const calculateEventEnd = (end: Date, startHour: number) => {
  return end.getHours() + end.getMinutes() / 60 - startHour;
};

// Current time calculation in hours
export const calculateNow = () => {
  const now = new Date();

  return now.getHours() + now.getMinutes() / 60;
};

// Event duration calculation
export const calculateEventDuration = (start: number, end: number) => {
  return end - start;
};

// Calculates the difference between the day container and the hours container
export const calculateDayHeight = (
  containerHeight: number,
  hoursContainerHeight: number,
) => {
  return containerHeight - hoursContainerHeight;
};

// Calculates the total hours displayed in the calender
export const calculateTotalHours = (startHour: number, endHour: number) => {
  return endHour - startHour;
};

// Calculates the height of 1 hour
export const calculateHourHeight = (
  hoursContainerHeight: number,
  totalHours: number,
) => {
  return hoursContainerHeight / totalHours;
};

// ====================================================== //
// ================ Calculation functions =============== //
// ====================================================== //

//TODO Implement event spanning multiple days
// Calculates the total height of the event with the event duration times the hour height
export const calculateEventHeight = ({
  start,
  end,
  startHour,
  endHour,
  hoursContainerHeight,
}: CalculationEventHeightProps) => {
  const eventStart = calculateEventStart(start, startHour);
  const eventEnd = calculateEventEnd(end, startHour);
  const eventDuration = calculateEventDuration(eventStart, eventEnd);
  const totalHours = calculateTotalHours(startHour, endHour);
  const hourHeight = calculateHourHeight(hoursContainerHeight, totalHours);

  return eventDuration * hourHeight;
};

// Calculates the top position of the event with event start time times the hour height
// plus the difference between the day container and the hours container
export const calculateTopPosition = ({
  start,
  startHour,
  endHour,
  hoursContainerHeight,
  containerHeight,
}: CalculationTopPositionProps) => {
  const eventStart = calculateEventStart(start, startHour);
  const totalHours = calculateTotalHours(startHour, endHour);
  const hourHeight = calculateHourHeight(hoursContainerHeight, totalHours);
  const dayHeight = calculateDayHeight(containerHeight, hoursContainerHeight);

  return eventStart * hourHeight + dayHeight;
};

// Calculates the left position based on how many events take place at the same time
export const calculateLeftPosition = ({
  overlapCount,
  overlapIndex,
}: CalculationLeftPositionProps) => {
  return (100 / overlapCount) * overlapIndex;
};

// Calculates the width based on how many events take place at the same time
export const calculateEventWidth = (overlapCount: number) => {
  return 100 / overlapCount;
};

// Calculates the marker position based on the current time
export const calculateMarkerPosition = ({
  startHour,
  endHour,
  hoursContainerHeight,
  containerHeight,
}: CalculationMarkerPositionProps) => {
  const now = calculateNow();
  const nowPosition = now - startHour;
  const totalHours = calculateTotalHours(startHour, endHour);
  const hourHeight = calculateHourHeight(hoursContainerHeight, totalHours);
  const dayHeight = calculateDayHeight(containerHeight, hoursContainerHeight);

  return nowPosition * hourHeight + dayHeight;
};

// Calculates the marker position height
export const calculateMarkerPositionFilled = ({
  startHour,
  endHour,
  hoursContainerHeight,
  containerHeight,
}: CalculationMarkerPositionProps) => {
  const markerPosition = calculateMarkerPosition({
    startHour: startHour,
    endHour: endHour,
    hoursContainerHeight: hoursContainerHeight,
    containerHeight: containerHeight,
  });
  const dayHeight = calculateDayHeight(containerHeight, hoursContainerHeight);

  return markerPosition - dayHeight;
};
