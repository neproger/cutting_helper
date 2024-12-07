export function getDate() {
    const currentDate = new Date();

    // Используем методы Date для получения дня, месяца и часа
    const day = currentDate.getDate();
    const month = currentDate.getMonth() + 1; // Месяцы в JavaScript начинаются с 0
    const hour = currentDate.getHours();
    const minutes = currentDate.getMinutes();

    // Добавляем ведущий ноль, если число меньше 10
    const formattedDay = day < 10 ? `0${day}` : day;
    const formattedMonth = month < 10 ? `0${month}` : month;
    const formattedHour = hour < 10 ? `0${hour}` : hour;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

    // Собираем отформатированную строку
    const formattedDate = `${formattedDay}.${formattedMonth}_${formattedHour}.${formattedMinutes}`;

    return formattedDate;
}