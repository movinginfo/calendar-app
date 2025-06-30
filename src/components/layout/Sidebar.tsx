import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Users, 
  Briefcase, 
  Bell, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  Plus,
  ListTodo
} from 'lucide-react';
import EventModal from '../events/EventModal';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  hasChildren?: boolean;
  isExpanded?: boolean;
  onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ 
  icon, 
  label, 
  isActive = false, 
  hasChildren = false,
  isExpanded = false,
  onClick 
}) => {
  return (
    <div
      className={`
        flex items-center justify-between px-3 py-2 rounded-md cursor-pointer
        ${isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}
      `}
      onClick={onClick}
    >
      <div className="flex items-center">
        <span className="mr-3">{icon}</span>
        <span className="text-sm font-medium">{label}</span>
      </div>
      
      {hasChildren && (
        isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />
      )}
    </div>
  );
};

interface SidebarProps {
  onViewChange: (view: 'calendar' | 'events' | 'people' | 'resources' | 'reminders' | 'availability') => void;
  currentView: string;
}

const Sidebar: React.FC<SidebarProps> = ({ onViewChange, currentView }) => {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    'calendars': true,
  });
  const [showEventModal, setShowEventModal] = useState(false);
  
  const handleItemClick = (id: string) => {
    if (['calendars', 'people', 'resources', 'reminders', 'availability'].includes(id)) {
      setExpandedItems(prev => ({
        ...prev,
        [id]: !prev[id]
      }));
    }
  };

  const handleCreateEvent = () => {
    setShowEventModal(true);
  };
  
  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-4">
        <button 
          className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          onClick={handleCreateEvent}
        >
          <Plus size={16} className="mr-1" />
          <span>Create Event</span>
        </button>
      </div>
      
      <nav className="px-3 py-2 space-y-1">
        {/* Calendar */}
        <SidebarItem 
          icon={<CalendarIcon size={18} />} 
          label="Calendar" 
          isActive={currentView === 'calendar'}
          onClick={() => onViewChange('calendar')}
        />

        {/* Events */}
        <SidebarItem 
          icon={<ListTodo size={18} />} 
          label="Events" 
          isActive={currentView === 'events'}
          onClick={() => onViewChange('events')}
        />
        
        {/* People */}
        <SidebarItem 
          icon={<Users size={18} />} 
          label="People" 
          isActive={currentView === 'people'}
          onClick={() => onViewChange('people')}
        />
        
        {/* Resources */}
        <SidebarItem 
          icon={<Briefcase size={18} />} 
          label="Resources" 
          isActive={currentView === 'resources'}
          onClick={() => onViewChange('resources')}
        />
        
        {/* Reminders */}
        <SidebarItem 
          icon={<Bell size={18} />} 
          label="Reminders" 
          isActive={currentView === 'reminders'}
          onClick={() => onViewChange('reminders')}
        />
        
        {/* Availability */}
        <SidebarItem 
          icon={<Clock size={18} />} 
          label="Availability" 
          isActive={currentView === 'availability'}
          onClick={() => onViewChange('availability')}
        />
      </nav>

      {/* Event Modal */}
      {showEventModal && (
        <EventModal
          event={null}
          isCreating={true}
          initialTime={{
            start: new Date(),
            end: new Date(new Date().setHours(new Date().getHours() + 1))
          }}
          onClose={() => setShowEventModal(false)}
        />
      )}
    </div>
  );
};

export default Sidebar;