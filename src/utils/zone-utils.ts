export const getZoneName = (zoneId: string, zones_: { id: string, name: string }[]) => {
    const zone = zones_.find((z) => z.id === zoneId);
    return zone ? zone.name : "Unknown Zone";
};
