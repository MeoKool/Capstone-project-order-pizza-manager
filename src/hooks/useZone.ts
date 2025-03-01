import ZoneService from "@/services/zone-service";
import { ZoneResponse } from "@/types/zone";
import { useCallback, useEffect, useState } from "react";

const useZone = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [zones_, setZones] = useState<ZoneResponse[]>([]);
    const zoneService = ZoneService.getInstance()

    //
    const getAllZone = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await zoneService.getAllZones();
            if (response.success && response.result) {
                setZones(response.result.items);
            } else {
                setZones([]);
            }
        } catch (error) {

        }
    }, [])
    useEffect(() => {
        getAllZone()

    }, [getAllZone])


    return { zones_, loading, error }
}
export default useZone