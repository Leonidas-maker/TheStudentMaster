interface CalculationEventHeightProps {
    start: Date;
    end: Date;
    startHour: number;
    endHour: number;
    hoursContainerHeight: number;
}

interface CalculationTopPositionProps {
    start: Date;
    startHour: number;
    endHour: number;
    hoursContainerHeight: number;
    containerHeight: number;
}

interface CalculationLeftPositionProps {
    overlapCount: number;
    overlapIndex: number;
}

interface CalculationMarkerPositionProps {
    startHour: number;
    endHour: number;
    hoursContainerHeight: number;
    containerHeight: number;
}

interface OverlapEventProps {
    start: Date;
    end: Date;
    overlapCount: number;
    overlapIndex: number;
}

interface EventProps {
    event: {
        summary: string;
        description?: string | null;
        location?: string;
        start: Date;
        end: Date;
    };
    hoursContainerHeight: number;
    containerHeight: number;
    calendar: {
        startHour: number;
        endHour: number;
    };
    overlapCount: number;
    overlapIndex: number;
    isSaturday: boolean;
}

interface HoursProps {
    startHour: number;
    endHour: number;
    onHeightChange: (height: number) => void;
}

interface PastMarkerProps {
    hoursContainerHeight: number;
    containerHeight: number;
    calendar: {
        startHour: number;
        endHour: number;
    };
    isToday: boolean;
}

interface TimeMarkerProps {
    hoursContainerHeight: number;
    containerHeight: number;
    calendar: {
        startHour: number;
        endHour: number;
    };
}

interface EventTimeProps {
    start: string | Date;
    end: string | Date;
    [key: string]: any;
}

interface CalendarProps {
    university_name: string;
    university_uuid: string;
    course_names: string[];
}

export { CalculationEventHeightProps, CalculationTopPositionProps, CalculationLeftPositionProps, CalculationMarkerPositionProps, OverlapEventProps, EventProps, HoursProps, PastMarkerProps, TimeMarkerProps, EventTimeProps, CalendarProps }