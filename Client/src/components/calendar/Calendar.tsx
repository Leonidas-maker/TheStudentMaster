import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet } from 'react-native';
import WeekView, { WeekViewEvent } from 'react-native-week-view';

const Calendar = () => {
  const { t } = useTranslation();

  const events: WeekViewEvent[] = [
    {
      id: 1,
      description: 'Event 1',
      startDate: new Date(new Date().setHours(new Date().getHours() - 1)),
      endDate: new Date(new Date().setHours(new Date().getHours() + 1)),
      color: 'blue',
      eventKind: 'standard', 
      resolveOverlap: 'lane',
      stackKey: 'default' 
    },
    {
      id: 2,
      description: 'Event 2',
      startDate: new Date(new Date().setDate(new Date().getDate() + 1)),
      endDate: new Date(new Date().setHours(new Date().getHours() + 2)),
      color: 'green',
      eventKind: 'block', 
      resolveOverlap: 'lane',
      stackKey: 'default' 
    },
    {
        id: 3,
        description: 'Event 3',
        startDate: new Date(new Date().setDate(new Date().getDate() + 2)),
        endDate: new Date(new Date().setHours(new Date().getHours() + 4)),
        color: 'green',
        eventKind: 'block', 
        resolveOverlap: 'stack', 
        stackKey: 'default' 
      },
  ];  

  const onEventPress = (event: WeekViewEvent) => {
    console.log(event);
  };

  return (
    <ScrollView style={styles.container}>
      <WeekView
        events={events}
        selectedDate={new Date()}
        numberOfDays={5}
        onEventPress={onEventPress}
        headerStyle={styles.weekViewHeader}
        eventContainerStyle={styles.eventContainer}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  welcomeContainer: {
    padding: 10,
  },
  welcomeText: {
    color: '#000000', 
    fontSize: 18,
  },
  weekViewHeader: {
    backgroundColor: '#ffffff',
  },
  eventContainer: {
    borderColor: 'black',
    borderWidth: 1,
  },
});

export default Calendar;