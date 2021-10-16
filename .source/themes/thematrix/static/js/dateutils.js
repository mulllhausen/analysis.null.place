var months = ["January", "February", "March", "April", "May", "June", "July",
"August", "September", "October", "November", "December"];

function getMonthName(monthNum, shortName) {
    month = months[parseInt(monthNum) - 1];
    if (month == null) throw monthNum + ' is not a month number';
    return shortName ? month.substr(0, 3) : month;
}

function dateYYYYMMDD2dmmmYYYY(dateYYYYMMDD) {
    var dateParts = dateYYYYMMDD.split('-');
    var yearAsYYYY = dateParts[0];
    var monthAsMM = dateParts[1];
    var dayAsDD = dateParts[2];
    var dayAsd = parseInt(dayAsDD); // '01' -> 1
    var shortName = true;
    var monthAsmmm = getMonthName(monthAsMM, shortName);
    return dayAsd + ' ' + monthAsmmm + ' ' + yearAsYYYY;
}

function unixtime(date) {
    switch (typeof date) {
        case 'string': // eg 03 Jan 2009 18:15:05 GMT
            return Math.round(Date.parse(date) / 1000);
        case 'object': // ie a Date() object
            return Math.round(date.getTime() / 1000);
        default:
            return Math.round((new Date()).getTime() / 1000);
    }
}
