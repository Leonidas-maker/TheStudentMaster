// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React, { useState, useEffect } from "react";
import { View, Text, LayoutChangeEvent } from "react-native";
import "nativewind";
import {
  format,
  startOfWeek,
  addDays,
  isSameDay,
  isToday,
  isPast,
  endOfWeek,
  isWithinInterval,
  getDay,
} from "date-fns";

import { enUS } from "date-fns/locale/en-US";
import { de } from "date-fns/locale/de";

import { useTranslation } from "react-i18next";

// ~~~~~~~~ Own components imports ~~~~~~~ //
import Hours from "./Hours";
import Event from "./Event";
import TimeMarker from "./TimeMarker";
import PastMarker from "./PastMarker";

// ~~~~~~~~~~ Interfaces imports ~~~~~~~~~ //
import { OverlapEventProps } from "../../interfaces/calendarInterfaces";

// ====================================================== //
// ====================== Component ===================== //
// ====================================================== //
const Days: React.FC<{ currentDate: Date; events: Array<any> }> = ({
  currentDate,
  events,
}) => {
  const { i18n } = useTranslation();

  // Checks the current language and sets the locale accordingly
  const locale = i18n.language === "de" ? de : enUS;

  // ====================================================== //
  // ======================= States ======================= //
  // ====================================================== //
  // State to store the height of the container
  const [containerHeight, setContainerHeight] = useState(0);

  // State to store the height of the hours container
  const [hoursContainerHeight, setHoursContainerHeight] = useState(0);

  // Sets the start of the current week (dynamically shift if no weekend events)
  const baseStartOfWeek = startOfWeek(currentDate, { weekStartsOn: 1 });
  const baseEndOfWeek = endOfWeek(currentDate, { weekStartsOn: 1 });
  const hasWeekendEvents = events.some((event) => {
    const day = getDay(event.start) === 0 ? 7 : getDay(event.start);
    return day === 6 || day === 7;
  });
  // Only shift to next week if it's already past Friday (Sat/Sun) and there are no weekend events
  const currentWeekDay = getDay(currentDate);
  const isPastFriday = currentWeekDay === 6 || currentWeekDay === 0;
  const shiftWeek = !hasWeekendEvents && isPastFriday;
  const startOfWeekDate = shiftWeek
    ? addDays(baseStartOfWeek, 7)
    : baseStartOfWeek;
  const endOfWeekDate = shiftWeek
    ? endOfWeek(startOfWeekDate, { weekStartsOn: 1 })
    : baseEndOfWeek;

  // State to store the hours of the calendar
  const [calenderHours, setCalenderHours] = useState({
    startHour: 8,
    endHour: 20,
  });

  // State to store the number of week days
  const [weekDays, setWeekDays] = useState(5);

  // State to store if it is Saturday or Sunday
  const [isSaturday, setIsSaturday] = useState(false);
  const [isSunday, setIsSunday] = useState(false);

  // Calculates the calendar hours when the events or the current date changes
  useEffect(() => {
    calculateCalendarData();
  }, [events, currentDate]);

  // ====================================================== //
  // ====================== Functions ===================== //
  // ====================================================== //
  const calculateCalendarData = () => {
    // Filters events that are within the current week
    const eventsThisWeek = events.filter((event) =>
      isWithinInterval(event.start, {
        start: startOfWeekDate,
        end: endOfWeekDate,
      }),
    );

    // Sets calendarHours and resets weekDays if no events are found in the current week
    if (eventsThisWeek.length === 0) {
      setCalenderHours({ startHour: 8, endHour: 20 });
      setWeekDays(5);
      setIsSaturday(false);
      setIsSunday(false);
      return;
    }

    // Sets start values for earliestStartHour and latestEndHour
    let earliestStartHour = Infinity;
    let latestEndHour = -Infinity;

    // Loops through the events to find the earliest start and latest end hour
    eventsThisWeek.forEach((event) => {
      const startHour = event.start.getHours();
      const endHour = event.end.getHours();
      earliestStartHour = Math.min(earliestStartHour, startHour);
      latestEndHour = Math.max(latestEndHour, endHour);

      // Filters events that are within the current week
      const eventsThisWeek = events.filter((event) =>
        isWithinInterval(event.start, {
          start: startOfWeekDate,
          end: endOfWeekDate,
        }),
      );

      // Compute the maximum day of the week for any event in this week
      let maxDay = 0;
      eventsThisWeek.forEach((event) => {
        const day = getDay(event.start) === 0 ? 7 : getDay(event.start);
        if (day > maxDay) {
          maxDay = day;
        }
      });

      // Set the weekDays state based on the maximum day found:
      // Sunday (7) -> 7 days, Saturday (6) -> 6 days, otherwise default to 5 days.
      if (maxDay === 7) {
        setWeekDays(7);
        setIsSunday(true);
        setIsSaturday(false);
      } else if (maxDay === 6) {
        setWeekDays(6);
        setIsSaturday(true);
        setIsSunday(false);
      } else {
        setWeekDays(5);
        setIsSaturday(false);
        setIsSunday(false);
      }
    });

    // Sets the calender hours to the earliest start and latest end hour that was found if there are events
    if (earliestStartHour !== Infinity && latestEndHour !== -Infinity) {
      // Adds 1 hour to the earliest start hour and subtracts 1 hour from the latest end hour
      // This is done to make sure that the events are not displayed at the edge of the calendar
      earliestStartHour -= 1;
      latestEndHour += 1;

      setCalenderHours({
        startHour: earliestStartHour,
        endHour: latestEndHour,
      });
    }
  };

  // Function to calculate the overlap of events
  const calculateOverlaps = (eventsForDay: OverlapEventProps[]) => {
    // Sorts the events by start time
    const sortedEvents: OverlapEventProps[] = [...eventsForDay].sort(
      (a, b) => a.start.getTime() - b.start.getTime(),
    );

    // Array to store the groups of overlapping events
    let overlapGroups: OverlapEventProps[][] = [];

    // Loops through the sorted events and groups them by overlapping events
    sortedEvents.forEach((event) => {
      let addedToGroup = false;
      for (const group of overlapGroups) {
        const lastEventEnd = new Date(
          Math.max(...group.map((e) => e.end.getTime())),
        );
        if (event.start < lastEventEnd) {
          group.push(event);
          addedToGroup = true;
          break;
        }
      }
      if (!addedToGroup) {
        overlapGroups.push([event]);
      }
    });

    // Loops through the groups and sets the overlap count and index for each event
    overlapGroups.forEach((group) => {
      group.forEach((event, index) => {
        event.overlapCount = group.length;
        event.overlapIndex = index;
      });
    });
  };

  // Function to set the height of the container
  const onLayout = (container: LayoutChangeEvent) => {
    const { height } = container.nativeEvent.layout;
    setContainerHeight(height);
  };

  // ====================================================== //
  // ================== Return component ================== //
  // ====================================================== //
  return (
    <View className="flex-1 flex-row w-full">
      <Hours
        startHour={calenderHours.startHour}
        endHour={calenderHours.endHour}
        onHeightChange={setHoursContainerHeight}
      />
      <View className="flex-1 flex-row justify-between" onLayout={onLayout}>
        {Array.from({ length: weekDays }).map((_, index) => {
          const day = addDays(startOfWeekDate, index);
          const eventsForDay = events.filter((event) =>
            isSameDay(event.start, day),
          );
          calculateOverlaps(eventsForDay);
          const isCurrentDay = isToday(day);
          const isPastDay = isPast(day);

          return (
            <View
              key={index}
              className="flex-1 items-center pt-2 border-l border-light_secondary dark:border-dark_secondary z-10"
            >
              <Text className="text-lg text-black dark:text-white">
                {/* Format the weekday using the selected locale */}
                {format(day, "eee", { locale })}
              </Text>
              <Text className="text-sm text-black dark:text-white">
                {/* Format the day and month using the selected locale */}
                {format(day, "d", { locale })}. {format(day, "LLL", { locale })}
              </Text>
              {eventsForDay.map((event, eventIndex) => (
                <Event
                  key={eventIndex}
                  event={event}
                  containerHeight={containerHeight}
                  hoursContainerHeight={hoursContainerHeight}
                  calendar={calenderHours}
                  overlapCount={event.overlapCount}
                  overlapIndex={event.overlapIndex}
                  isSaturday={isSaturday}
                  isSunday={isSunday}
                />
              ))}
              <View
                className="absolute top-0 w-full h-full z-20"
                style={{ pointerEvents: "none" }}
              >
                {isPastDay && (
                  <PastMarker
                    containerHeight={containerHeight}
                    hoursContainerHeight={hoursContainerHeight}
                    calendar={calenderHours}
                    isToday={isCurrentDay}
                  />
                )}
                {isCurrentDay && (
                  <TimeMarker
                    containerHeight={containerHeight}
                    hoursContainerHeight={hoursContainerHeight}
                    calendar={calenderHours}
                  />
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default Days;
