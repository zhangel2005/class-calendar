import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Lock, Eye } from 'lucide-react';

const ClassCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(9);
  const [currentYear, setCurrentYear] = useState(2025);
  const [selectedDates, setSelectedDates] = useState({});
  const [hoveredColor, setHoveredColor] = useState(null);
  const [clickedColor, setClickedColor] = useState(null);
  const [isEditor, setIsEditor] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(true);
  
  const EDITOR_PASSWORD = 'admin123'; // Change this to your desired password

  const classTypes = [
    { id: 'next', color: 'bg-gray-400', label: 'Next Class', hours: 0, fee: 0 },
    { id: 'pink', color: 'bg-pink-400', label: 'Math Class (1.5 hours)', hours: 1.5, fee: 1000 },
    { id: 'blue', color: 'bg-blue-400', label: 'Math Class (2 hours)', hours: 2, fee: 1500 },
    { id: 'purple', color: 'bg-purple-400', label: 'Math Class (1 hour)', hours: 1, fee: 1000 }
  ];

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];

  // Load saved data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await window.storage.get('class-schedule-data');
        if (result) {
          setSelectedDates(JSON.parse(result.value));
        }
      } catch (error) {
        console.log('No saved data found');
      }
    };
    loadData();
  }, []);

  // Save data whenever it changes (only if editor)
  useEffect(() => {
    const saveData = async () => {
      if (isEditor && Object.keys(selectedDates).length > 0) {
        try {
          await window.storage.set('class-schedule-data', JSON.stringify(selectedDates));
        } catch (error) {
          console.error('Error saving data:', error);
        }
      }
    };
    saveData();
  }, [selectedDates, isEditor]);

  const handlePasswordSubmit = () => {
    if (passwordInput === EDITOR_PASSWORD) {
      setIsEditor(true);
      setShowPasswordPrompt(false);
    } else if (passwordInput === '') {
      setShowPasswordPrompt(false);
    } else {
      alert('Incorrect password. You will enter as viewer.');
      setShowPasswordPrompt(false);
    }
  };

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleDateClick = (day, classType) => {
    if (!isEditor) return;
    const dateKey = `${currentYear}-${currentMonth}-${day}`;
    setSelectedDates(prev => ({
      ...prev,
      [dateKey]: classType
    }));
  };

  const calculateFees = () => {
    const counts = { pink: 0, blue: 0, purple: 0 };
    const currentMonthKey = `${currentYear}-${currentMonth}`;
    
    Object.entries(selectedDates).forEach(([dateKey, classType]) => {
      if (dateKey.startsWith(currentMonthKey) && classType !== 'next') {
        counts[classType] = (counts[classType] || 0) + 1;
      }
    });

    const fees = {
      pink: counts.pink * 1000,
      blue: counts.blue * 1500,
      purple: counts.purple * 1000
    };

    const total = fees.pink + fees.blue + fees.purple;
    const totalClasses = counts.pink + counts.blue + counts.purple;

    return { counts, fees, total, totalClasses };
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-20"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${currentYear}-${currentMonth}-${day}`;
      const selectedClass = selectedDates[dateKey];
      
      days.push(
        <div key={day} className="relative group">
          <div className={`h-20 border border-gray-300 rounded-lg flex flex-col items-center justify-center transition-all hover:shadow-lg ${
            selectedClass ? classTypes.find(c => c.id === selectedClass)?.color : 'bg-white'
          } ${isEditor ? 'cursor-pointer' : 'cursor-default'}`}>
            <span className={`text-lg font-semibold ${selectedClass ? 'text-white' : 'text-gray-700'}`}>
              {day}
            </span>
            
            {isEditor && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                {classTypes.map((classType) => (
                  <button
                    key={classType.id}
                    onClick={() => handleDateClick(day, classType.id)}
                    className={`w-full px-4 py-2 text-left hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg flex items-center gap-2`}
                  >
                    <div className={`w-4 h-4 rounded ${classType.color}`}></div>
                    <span className="text-sm">{classType.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const { counts, fees, total, totalClasses } = calculateFees();

  // Password prompt screen
  if (showPasswordPrompt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <Lock className="w-16 h-16 mx-auto text-indigo-600 mb-4" />
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome</h2>
            <p className="text-gray-600">Enter password to edit, or leave blank to view only</p>
          </div>
          
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
            placeholder="Password (optional)"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-indigo-500"
          />
          
          <button
            onClick={handlePasswordSubmit}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Mode Indicator */}
        <div className="flex justify-end mb-4">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
            isEditor ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {isEditor ? <Lock className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span className="font-semibold">{isEditor ? 'Editor Mode' : 'View Only'}</span>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-center gap-8 mb-8">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-full hover:bg-white/50 transition-all"
          >
            <ChevronLeft className="w-8 h-8 text-gray-700" />
          </button>
          <h1 className="text-4xl font-bold text-gray-800">
            {monthNames[currentMonth]} {currentYear}
          </h1>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-full hover:bg-white/50 transition-all"
          >
            <ChevronRight className="w-8 h-8 text-gray-700" />
          </button>
        </div>

        {/* Color Legend */}
        <div className="flex items-center justify-center gap-6 mb-8">
          {classTypes.map((classType) => (
            <div
              key={classType.id}
              className="relative"
              onMouseEnter={() => setHoveredColor(classType.id)}
              onMouseLeave={() => setHoveredColor(null)}
              onClick={() => setClickedColor(clickedColor === classType.id ? null : classType.id)}
            >
              <div
                className={`transition-all duration-300 cursor-pointer ${
                  hoveredColor === classType.id || clickedColor === classType.id
                    ? `w-12 h-12 ${classType.color} rounded-lg`
                    : `w-12 h-12 ${classType.color} rounded-full`
                }`}
              ></div>
              
              {(hoveredColor === classType.id || clickedColor === classType.id) && (
                <div className="absolute left-14 top-0 bg-white px-4 py-2 rounded-lg shadow-lg whitespace-nowrap animate-in slide-in-from-left duration-300 z-10">
                  <span className="text-sm font-medium text-gray-700">{classType.label}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-8">
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-semibold text-gray-600 py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {renderCalendar()}
          </div>
        </div>

        {/* Fee Summary */}
        <div className="bg-gradient-to-br from-red-400/80 to-blue-500/80 rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-white mb-6 text-center drop-shadow-lg">
            Class Fees
          </h2>
          
          <div className="mb-6">
            <p className="text-white text-xl font-semibold drop-shadow">
              Number of Classes: {totalClasses}
            </p>
          </div>

          <div className="space-y-4 mb-6">
            {classTypes.slice(1).map((classType) => (
              <div
                key={classType.id}
                className="flex items-center gap-4 text-white text-lg font-medium drop-shadow"
                onMouseEnter={() => setHoveredColor(classType.id)}
                onMouseLeave={() => setHoveredColor(null)}
              >
                <div className="relative">
                  <div
                    className={`transition-all duration-300 border-2 border-white ${
                      hoveredColor === classType.id
                        ? `w-10 h-10 ${classType.color} rounded-lg`
                        : `w-10 h-10 ${classType.color} rounded-full`
                    }`}
                  ></div>
                  {hoveredColor === classType.id && (
                    <div className="absolute left-12 top-0 bg-white px-3 py-1 rounded-lg shadow-lg whitespace-nowrap animate-in slide-in-from-left duration-300 z-10">
                      <span className="text-sm font-medium text-gray-700">{classType.label}</span>
                    </div>
                  )}
                </div>
                <span className="text-2xl">×</span>
                <span className="w-8 text-center">{counts[classType.id]}</span>
                <span className="text-2xl">=</span>
                <span className="font-bold">Rs. {fees[classType.id].toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t-2 border-white/30">
            <p className="text-white text-2xl font-bold drop-shadow-lg">
              Total Fees: Rs. {total.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassCalendar;

