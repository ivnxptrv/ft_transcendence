export declare class TimeSlotDto {
    day: string;
    startTime: string;
    endTime: string;
}
export declare class CreateProviderProfileDto {
    title: string;
    description: string;
    hourlyRate: number;
    location?: string;
    languages?: string[];
    yearsExperience?: number;
    timeSlots?: TimeSlotDto[];
}
