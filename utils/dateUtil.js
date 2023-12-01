function getLocalDate() {
    // Create a new Date object for the current date and time
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const timeZoneOffsetInMinutes = -new Date().getTimezoneOffset();
    // console.log(currentDate)
    // console.log(timeZoneOffsetInMinutes)

    // Adjust the current date and time based on the time zone offset
    const currentDateInIndia = new Date(currentDate.getTime() + timeZoneOffsetInMinutes * 60000);


    return currentDateInIndia;
}

function getOlderDate(time) {
    const localDate = getLocalDate();
    const otherDate = getLocalDate();

    switch (time) {
        case '24h': return new Date(otherDate.setDate(localDate.getDate() - 1));
        case '30d': return new Date(otherDate.setDate(localDate.getDate() - 30));
        case '60d': return new Date(otherDate.setDate(localDate.getDate() - 60));
        case '90d': return new Date(otherDate.setDate(localDate.getDate() - 90));
        case '120d': return new Date(otherDate.setDate(localDate.getDate() - 120));
        case '365d': return new Date(otherDate.setDate(localDate.getDate() - 365));
        case '395d': return new Date(otherDate.setDate(localDate.getDate() - 395));
        default:
        case 'latest': return localDate;
    }
}

module.exports = { getLocalDate, getOlderDate };