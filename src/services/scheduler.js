function timeToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function overlap(a, b) {
  return (
    a.day === b.day &&
    timeToMinutes(a.startTime) < timeToMinutes(b.endTime) &&
    timeToMinutes(b.startTime) < timeToMinutes(a.endTime)
  );
}

function teacherAvailableAt(teacher, day, start, end) {
  if (!teacher.availability || teacher.availability.length === 0) return true;
  const startM = timeToMinutes(start);
  const endM = timeToMinutes(end);
  return teacher.availability.some(
    (a) =>
      a.day === day &&
      timeToMinutes(a.startTime) <= startM &&
      timeToMinutes(a.endTime) >= endM
  );
}

function roomAvailableAt(room, day, start, end) {
  if (!room.availability || room.availability.length === 0) return true;
  const startM = timeToMinutes(start);
  const endM = timeToMinutes(end);
  return room.availability.some(
    (a) =>
      a.day === day &&
      timeToMinutes(a.startTime) <= startM &&
      timeToMinutes(a.endTime) >= endM
  );
}

export function generateTimetable(courses, teachers, rooms, settings) {
  const slots = [];
  const days = settings.workingDays;
  const startH = parseInt(settings.startTime.split(":")[0], 10);
  const endH = parseInt(settings.endTime.split(":")[0], 10);
  const breakStart = settings.breakStart;
  const breakEnd = settings.breakEnd;

  const allTimeSlots = [];
  for (const day of days) {
    for (let h = startH; h < endH; h++) {
      const start = `${String(h).padStart(2, "0")}:00`;
      const end = `${String(h + 1).padStart(2, "0")}:00`;
      if (start >= breakStart && start < breakEnd) continue;
      allTimeSlots.push({ day, startTime: start, endTime: end });
    }
  }

  for (const course of courses) {
    const teacher = course.teacher || teachers[Math.floor(Math.random() * teachers.length)];
    const room = course.room || rooms[Math.floor(Math.random() * rooms.length)];
    if (!teacher || !room) continue;

    let placed = 0;
    const sessionsNeeded = course.sessionsPerWeek || 2;

    for (const slot of allTimeSlots) {
      if (placed >= sessionsNeeded) break;

      const teacherFree = teacherAvailableAt(teacher, slot.day, slot.startTime, slot.endTime);
      const roomFree = roomAvailableAt(room, slot.day, slot.startTime, slot.endTime);
      if (!teacherFree || !roomFree) continue;

      const teacherClash = slots.some(
        (s) => String(s.teacher) === String(teacher._id) && overlap(s, slot)
      );
      const roomClash = slots.some(
        (s) => String(s.room) === String(room._id) && overlap(s, slot)
      );
      const courseClash = slots.some(
        (s) => String(s.course) === String(course._id) && s.day === slot.day
      );

      if (teacherClash || roomClash || courseClash) continue;

      slots.push({
        course: course._id,
        teacher: teacher._id,
        room: room._id,
        day: slot.day,
        startTime: slot.startTime,
        endTime: slot.endTime,
        hasConflict: false,
        conflictReason: "",
      });
      placed++;
    }
  }

  return slots;
}

export function detectConflicts(slots) {
  const result = slots.map((s) => {
    const obj = s.toObject ? s.toObject() : { ...s };
    obj.hasConflict = false;
    obj.conflictReason = "";
    return obj;
  });

  for (let i = 0; i < result.length; i++) {
    for (let j = i + 1; j < result.length; j++) {
      if (overlap(result[i], result[j])) {
        if (String(result[i].teacher) === String(result[j].teacher)) {
          result[i].hasConflict = true;
          result[j].hasConflict = true;
          result[i].conflictReason = "Teacher double-booked";
          result[j].conflictReason = "Teacher double-booked";
        }
        if (String(result[i].room) === String(result[j].room)) {
          result[i].hasConflict = true;
          result[j].hasConflict = true;
          result[i].conflictReason = "Room double-booked";
          result[j].conflictReason = "Room double-booked";
        }
      }
    }
  }

  return result;
}
