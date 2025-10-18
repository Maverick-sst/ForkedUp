import React from 'react';
import { FaPlus, FaTrash, FaClock } from 'react-icons/fa';
import AccordionSection from '../../../components/AccordionSection';

// Helper to generate time options for the dropdowns
const timeOptions = [];
for (let i = 0; i < 24; i++) {
  for (let j = 0; j < 60; j += 30) {
    const hour = i.toString().padStart(2, '0');
    const minute = j.toString().padStart(2, '0');
    timeOptions.push(`${hour}:${minute}`);
  }
}

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];


const DaySchedule = ({ day, dayIndex, onInputChange, onAddPeriod, onRemovePeriod }) => {
  return (
    <div className="py-3 border-b border-brand-gray-light last:border-b-0">
      <div className="flex items-center justify-between">
        <label className="font-semibold text-brand-gray">{daysOfWeek[dayIndex]}</label>
        <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              name={`workingHours.${dayIndex}.isOpen`}
              checked={day.isOpen}
              onChange={onInputChange}
              className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-green"></div>
        </label>
      </div>

      {day.isOpen && (
        <div className="pl-4 mt-2 space-y-2 animate-fade-in">
          {day.periods.map((period, periodIndex) => (
            <div key={periodIndex} className="flex items-center gap-2">
              <select 
                name={`workingHours.${dayIndex}.periods.${periodIndex}.openTime`} 
                value={period.openTime} 
                onChange={onInputChange} 
                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-orange focus:ring-brand-orange"
              >
                  {/* --- THIS IS THE FIX --- */}
                  {timeOptions.map(time => <option key={`open-${time}`} value={time}>{time}</option>)}
              </select>
              <span>-</span>
              <select 
                name={`workingHours.${dayIndex}.periods.${periodIndex}.closeTime`} 
                value={period.closeTime} 
                onChange={onInputChange} 
                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-orange focus:ring-brand-orange"
              >
                  {/* --- THIS IS THE FIX --- */}
                  {timeOptions.map(time => <option key={`close-${time}`} value={time}>{time}</option>)}
              </select>
              <button type="button" onClick={() => onRemovePeriod(dayIndex, periodIndex)} className="text-red-500 hover:text-red-700">
                  <FaTrash />
              </button>
            </div>
          ))}

          <button type="button" onClick={() => onAddPeriod(dayIndex)} className="flex items-center text-sm text-brand-orange hover:underline">
              <FaPlus className="mr-1" size={12}/> Add hours
          </button>
        </div>
      )}
    </div>
  );
};

const WorkingHours = ({ workingHoursData, isOpen, onToggle, onInputChange, onAddPeriod, onRemovePeriod, onApplyToAll }) => {
  return (
    <AccordionSection title="Working Hours" icon={FaClock} isOpen={isOpen} onClick={onToggle}>
      {Array.isArray(workingHoursData) && workingHoursData.map((day, index) => (
        <DaySchedule 
          key={index}
          day={day}
          dayIndex={index}
          onInputChange={onInputChange}
          onAddPeriod={onAddPeriod}
          onRemovePeriod={onRemovePeriod}
        />
      ))}
       <div className="mt-4 flex justify-end">
          <button type="button" onClick={onApplyToAll} className="text-sm text-brand-orange hover:underline">Apply Monday to all days</button>
       </div>
    </AccordionSection>
  );
};

export default WorkingHours;

