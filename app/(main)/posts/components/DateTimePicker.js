'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';

const DateTimePicker = ({ date, setDate }) => {
  const hours = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, '0')
  );
  const minutes = Array.from({ length: 12 }, (_, i) =>
    (i * 5).toString().padStart(2, '0')
  );

  const updateTime = (type, value) => {
    const newDate = new Date(date);
    if (type === 'hour') {
      newDate.setHours(parseInt(value, 10));
    } else if (type === 'minute') {
      newDate.setMinutes(parseInt(value, 10));
    }
    setDate(newDate);
  };

  const formatSelectedDateTime = () => {
    return format(date, "PPP 'at' p");
  };

  const isToday = () => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isFuture = () => {
    return date > new Date();
  };

  return (
    <div className="space-y-4">
      {/* Date Selection */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-slate-700 flex items-center">
            <CalendarIcon className="w-4 h-4 mr-2" />
            Select Date
          </h4>
          {isToday() && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
              Today
            </span>
          )}
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full justify-start text-left font-normal h-12 rounded-lg border-2 border-slate-200 hover:border-slate-300',
                !date && 'text-slate-500'
              )}
            >
              <CalendarIcon className="mr-3 h-4 w-4" />
              {date ? format(date, 'PPPP') : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-white shadow-xl border-2 border-slate-200 rounded-xl">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => setDate(newDate || new Date())}
              initialFocus
              disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
              className="rounded-xl"
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Time Selection */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-slate-700 flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            Select Time
          </h4>
          <span className="text-xs text-slate-500">
            {format(date, 'h:mm a')}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-600 mb-2 block">
              Hour
            </label>
            <Select
              onValueChange={(hour) => updateTime('hour', hour)}
              value={date.getHours().toString().padStart(2, '0')}
            >
              <SelectTrigger className="h-12 rounded-lg border-2 border-slate-200 focus:border-blue-400">
                <SelectValue placeholder="Hour" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {hours.map((h) => (
                  <SelectItem key={h} value={h} className="font-mono">
                    {h}:00 {parseInt(h) < 12 ? 'AM' : 'PM'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 mb-2 block">
              Minute
            </label>
            <Select
              onValueChange={(minute) => updateTime('minute', minute)}
              value={(Math.floor(date.getMinutes() / 5) * 5)
                .toString()
                .padStart(2, '0')}
            >
              <SelectTrigger className="h-12 rounded-lg border-2 border-slate-200 focus:border-blue-400">
                <SelectValue placeholder="Minute" />
              </SelectTrigger>
              <SelectContent>
                {minutes.map((m) => (
                  <SelectItem key={m} value={m} className="font-mono">
                    :{m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div
        className={cn(
          'p-4 rounded-xl border-2',
          isFuture()
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-emerald-200'
            : 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200'
        )}
      >
        <div className="flex items-start justify-between">
          <div>
            <h5 className="font-semibold text-slate-700 mb-1">
              📅 Scheduled Publication
            </h5>
            <p className="text-sm text-slate-600 font-medium">
              {formatSelectedDateTime()}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {isFuture()
                ? `This story will be published automatically in ${Math.ceil(
                    (date - new Date()) / (1000 * 60 * 60)
                  )} hours`
                : 'This time has already passed. The story will be published immediately.'}
            </p>
          </div>
          <div
            className={cn(
              'w-3 h-3 rounded-full',
              isFuture() ? 'bg-emerald-500' : 'bg-blue-500'
            )}
          />
        </div>
      </div>

      <div className="text-center">
        <p className="text-xs text-slate-500 bg-slate-50 rounded-lg p-3 border border-slate-200">
          🌍 Time is displayed in your local timezone (
          {Intl.DateTimeFormat().resolvedOptions().timeZone})
        </p>
      </div>
    </div>
  );
};

export default DateTimePicker;
