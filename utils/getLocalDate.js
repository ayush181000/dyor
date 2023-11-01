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

module.exports = getLocalDate;