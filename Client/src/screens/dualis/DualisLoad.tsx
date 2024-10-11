import React, { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import * as Progress from "react-native-progress";
import { useNavigation } from "@react-navigation/native";

// ~~~~~~~~~~~~~~~ Own components imports ~~~~~~~~~~~~~~~ //
import Heading from "../../components/textFields/Heading";
import Subheading from "../../components/textFields/Subheading";
import { secureLoadData } from "../../components/storageManager/secureStorageManager";

import {
    navigateToPerformanceOverview,
    navigateToExamResults,
    navigateThroughSemesters,
    navigateThroughGradeDetails,
} from "../../services/dualis/navigationService";

import {
    ModuleData,
    GpaData,
    EctsData,
    SemesterData,
    GradeData,
    GpaSemesterData,
} from "../../interfaces/dualisInterfaces";

const DualisLoad: React.FC = () => {
    // ~~~~~~~~~~~ Define navigator ~~~~~~~~~~ //
    const navigation = useNavigation<any>();

    const [authArguments, setAuthArguments] = useState<string>("");
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [moduleData, setModuleData] = useState<Array<ModuleData>>([]);
    const [gradeData, setGradeData] = useState<GradeData[]>([]);
    const [gpaSemesterData, setGpaSemesterData] = useState<GpaSemesterData[]>([]);
    const [gpaData, setGpaData] = useState<GpaData>({
        gpaTotal: "",
        gpaSubject: "",
    });
    const [ectsData, setEctsData] = useState<EctsData>({
        ectsTotal: "",
        ectsSum: "",
    });
    const [semesterData, setSemesterData] = useState<SemesterData>({
        semester: [],
    });
    const [navigatedThroughSemesters, setNavigatedThroughSemesters] =
        useState(false);
    const [navigatedThroughGradeDetails, setNavigatedThroughGradeDetails] =
        useState(false);

    useEffect(() => {
        setLoading(true);
        setProgress(0);
        const loadAuthArgs = async () => {
            const authArguments = await secureLoadData("dualisAuthArgs");

            if (authArguments) setAuthArguments(authArguments);
        };

        loadAuthArgs();
    }, []);

    useEffect(() => {
        const handlePerformanceOverviewNavigation = async () => {
            if (authArguments) {
                await navigateToPerformanceOverview(
                    authArguments,
                    setModuleData,
                    setGpaData,
                    setEctsData,
                    setProgress,
                    setError,
                );
            }
        };

        handlePerformanceOverviewNavigation();
    }, [authArguments]);

    useEffect(() => {
        const handleExamResultsNavigation = async () => {
            if (authArguments) {
                await navigateToExamResults(
                    authArguments,
                    setSemesterData,
                    setProgress,
                    setError,
                );
            }
        };

        handleExamResultsNavigation();
    }, [authArguments]);

    useEffect(() => {
        const handleSemesterNavigation = async () => {
            if (
                semesterData.semester.length > 0 &&
                authArguments &&
                !navigatedThroughSemesters
            ) {
                setNavigatedThroughSemesters(true);
                await navigateThroughSemesters(
                    authArguments,
                    semesterData.semester,
                    setGradeData,
                    setGpaSemesterData,
                    setProgress,
                    setError,
                );
            }
        };

        handleSemesterNavigation();
    }, [semesterData.semester, authArguments]);

    useEffect(() => {
        const handleGradeDetailsNavigation = async () => {
            if (
                gradeData.length > 0 &&
                authArguments &&
                !navigatedThroughGradeDetails
            ) {
                setNavigatedThroughGradeDetails(true);
                await navigateThroughGradeDetails(
                    gradeData,
                    setGradeData,
                    setProgress,
                    setError,
                    setLoading,
                );

                navigation.navigate("Dualis", {
                    screen: "DualisPerfomance",
                    params: {
                        moduleData,
                        gpaData,
                        ectsData,
                        semesterData,
                        gradeData,
                        gpaSemesterData,
                    }
                });
            }
        };

        handleGradeDetailsNavigation();
    }, [gradeData, authArguments]);
    return (
        <ScrollView className="h-screen bg-light_primary dark:bg-dark_primary">
            <Heading text="Dualis" />
            {loading && <Progress.Bar progress={progress} width={null} />}
            <Subheading text="Load..." />
        </ScrollView>
    );
};

export default DualisLoad;
