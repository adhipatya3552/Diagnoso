import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Star, 
  MapPin, 
  Clock, 
  Calendar, 
  MessageCircle, 
  Video, 
  Phone, 
  Award, 
  Heart, 
  Globe, 
  BookOpen, 
  Briefcase, 
  Check, 
  ChevronDown, 
  ChevronUp,
  DollarSign,
  Shield,
  Users,
  ThumbsUp,
  Share2,
  User
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { Button } from '../../components/ui/Button';
import { TabNavigation } from '../../components/navigation/TabNavigation';

interface DoctorData {
  id: string;
  name: string;
  specialty: string;
  bio: string;
  profile_photo_url: string;
  rating: number;
  reviews_count: number;
  years_experience: number;
  education: string[];
  certifications: string[];
  languages_spoken: string[];
  hospital_affiliations: string[];
  consultation_fee: number;
  location: string;
  availability_hours: Record<string, { start: string; end: string; available: boolean }>;
  next_available: string;
  response_time: string;
  patients_count: number;
  verified: boolean;
  consultation_types: ('video' | 'phone' | 'in_person')[];
}

interface Review {
  id: string;
  patient_name: string;
  patient_avatar?: string;
  rating: number;
  date: string;
  comment: string;
  helpful_count: number;
  is_verified: boolean;
}

export const DoctorProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<DoctorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('about');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    education: false,
    certifications: false,
    affiliations: false
  });
  
  // For demo purposes, we'll use a mock doctor
  const mockDoctor: DoctorData = {
    id: '1',
    name: 'Dr. Sarah Johnson',
    specialty: 'Cardiology',
    bio: 'Board-certified cardiologist specializing in preventive cardiology, heart disease management, and interventional procedures. With over 15 years of experience, I focus on providing comprehensive heart care using the latest evidence-based approaches. My practice emphasizes patient education and lifestyle modifications alongside medical interventions.',
    profile_photo_url: 'https://images.pexels.com/photos/559827/pexels-photo-559827.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
    rating: 4.9,
    reviews_count: 127,
    years_experience: 15,
    education: [
      'MD, Harvard Medical School',
      'Residency in Internal Medicine, Massachusetts General Hospital',
      'Fellowship in Cardiology, Johns Hopkins Hospital',
      'Board Certification in Cardiovascular Disease'
    ],
    certifications: [
      'American Board of Internal Medicine',
      'American College of Cardiology Fellow',
      'Advanced Cardiac Life Support (ACLS)',
      'Certified in Cardiovascular Computed Tomography'
    ],
    languages_spoken: ['English', 'Spanish'],
    hospital_affiliations: [
      'New York Presbyterian Hospital',
      'Mount Sinai Medical Center',
      'NYU Langone Health'
    ],
    consultation_fee: 150,
    location: 'New York, NY',
    availability_hours: {
      monday: { start: '09:00', end: '17:00', available: true },
      tuesday: { start: '09:00', end: '17:00', available: true },
      wednesday: { start: '09:00', end: '17:00', available: true },
      thursday: { start: '09:00', end: '17:00', available: true },
      friday: { start: '09:00', end: '17:00', available: true },
      saturday: { start: '09:00', end: '13:00', available: true },
      sunday: { start: '00:00', end: '00:00', available: false }
    },
    next_available: '2025-01-02T14:00:00',
    response_time: '< 2 hours',
    patients_count: 1500,
    verified: true,
    consultation_types: ['video', 'in_person']
  };

  const mockReviews: Review[] = [
    {
      id: '1',
      patient_name: 'John D.',
      patient_avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      rating: 5,
      date: '2024-12-15',
      comment: 'Dr. Johnson is an exceptional cardiologist. She took the time to explain my condition in detail and answered all my questions. Her approach is both professional and compassionate.',
      helpful_count: 12,
      is_verified: true
    },
    {
      id: '2',
      patient_name: 'Maria G.',
      patient_avatar: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      rating: 5,
      date: '2024-12-10',
      comment: "I've been seeing Dr. Johnson for over a year now. She's helped me manage my heart condition with a combination of medication and lifestyle changes. My health has improved significantly under her care.",
      helpful_count: 8,
      is_verified: true
    },
    {
      id: '3',
      patient_name: 'Robert T.',
      rating: 4,
      date: '2024-12-05',
      comment: "Very knowledgeable doctor. The only reason I'm not giving 5 stars is because the wait time was longer than expected. Otherwise, the consultation itself was excellent.",
      helpful_count: 3,
      is_verified: true
    }
  ];

  useEffect(() => {
    const fetchDoctorData = async () => {
      setLoading(true);
      try {
        // In a real app, you would fetch from Supabase
        // const { data, error } = await supabase
        //   .from('users')
        //   .select(`
        //     *,
        //     doctor_profiles(*)
        //   `)
        //   .eq('id', id)
        //   .eq('role', 'doctor')
        //   .single();
        
        // if (error) throw error;
        
        // For demo, use mock data
        setTimeout(() => {
          setDoctor(mockDoctor);
          setReviews(mockReviews);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching doctor:', error);
        setLoading(false);
      }
    };

    fetchDoctorData();
  }, [id]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getAvailableTimeSlots = (date: Date) => {
    // In a real app, this would come from the doctor's availability data
    // For demo, generate some time slots
    const day = date.toLocaleDateString('en-US', { weekday: 'lowercase' }) as keyof typeof mockDoctor.availability_hours;
    const availability = mockDoctor.availability_hours[day];
    
    if (!availability.available) return [];
    
    const slots = [];
    const start = parseInt(availability.start.split(':')[0]);
    const end = parseInt(availability.end.split(':')[0]);
    
    for (let hour = start; hour < end; hour++) {
      slots.push(`${hour}:00`);
      if (hour < end - 1) {
        slots.push(`${hour}:30`);
      }
    }
    
    return slots;
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null);
  };

  const handleTimeSlotSelect = (slot: string) => {
    setSelectedTimeSlot(slot);
  };

  const handleBookAppointment = () => {
    if (!selectedTimeSlot) return;
    
    // In a real app, you would save the appointment to Supabase
    // For demo, just navigate to appointments page
    navigate('/patient/appointments');
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3">
            <LoadingSkeleton variant="circular" width="100%" height={300} className="mb-4" />
            <LoadingSkeleton variant="text" width="80%" className="mx-auto" />
            <LoadingSkeleton variant="text" width="60%" className="mx-auto mt-2" />
          </div>
          <div className="md:w-2/3">
            <LoadingSkeleton variant="text" width="70%" height={40} className="mb-4" />
            <LoadingSkeleton variant="text" width="100%" className="mb-2" />
            <LoadingSkeleton variant="text" width="100%" className="mb-2" />
            <LoadingSkeleton variant="text" width="90%" className="mb-4" />
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <LoadingSkeleton variant="rectangular" height={100} />
              <LoadingSkeleton variant="rectangular" height={100} />
              <LoadingSkeleton variant="rectangular" height={100} />
              <LoadingSkeleton variant="rectangular" height={100} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Doctor Not Found</h2>
        <p className="text-gray-600 mb-6">The doctor you're looking for doesn't exist or has been removed.</p>
        <Button 
          variant="primary" 
          onClick={() => navigate('/patient/doctors')}
        >
          Back to Doctors
        </Button>
      </div>
    );
  }

  const nextAvailableDate = new Date(doctor.next_available);
  const timeUntilAvailable = Math.max(0, Math.floor((nextAvailableDate.getTime() - new Date().getTime()) / (1000 * 60 * 60)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl mb-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Doctor Photo and Quick Stats */}
            <div className="md:w-1/3">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-teal-400 to-blue-500 rounded-2xl opacity-75 blur-sm group-hover:opacity-100 transition-all duration-500"></div>
                <div className="relative">
                  <img 
                    src={doctor.profile_photo_url} 
                    alt={doctor.name}
                    className="w-full h-auto rounded-xl object-cover aspect-square shadow-lg"
                  />
                  {doctor.verified && (
                    <div className="absolute top-4 right-4 bg-green-500 text-white p-2 rounded-full shadow-lg">
                      <Shield className="w-5 h-5" />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="text-xl font-bold text-gray-800">{doctor.rating}</span>
                  <span className="text-gray-600">({doctor.reviews_count} reviews)</span>
                </div>
                
                <div className="flex items-center justify-center space-x-4 text-gray-600 mb-4">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{doctor.patients_count}+ patients</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{doctor.years_experience} years</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  {doctor.consultation_types.map(type => (
                    <span 
                      key={type}
                      className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${
                        type === 'video' ? 'bg-green-100 text-green-800' :
                        type === 'phone' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {type === 'video' ? <Video className="w-3 h-3" /> :
                       type === 'phone' ? <Phone className="w-3 h-3" /> :
                       <MapPin className="w-3 h-3" />}
                      <span>{type.replace('_', ' ')}</span>
                    </span>
                  ))}
                </div>
                
                <div className="flex justify-center space-x-2">
                  <Button 
                    variant="primary" 
                    size="sm"
                    icon={MessageCircle}
                  >
                    Message
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    icon={Share2}
                  >
                    Share
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Doctor Info */}
            <div className="md:w-2/3">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-1">{doctor.name}</h1>
                <p className="text-teal-600 font-medium text-lg mb-2">{doctor.specialty}</p>
                <div className="flex items-center space-x-2 text-gray-600 mb-4">
                  <MapPin className="w-4 h-4" />
                  <span>{doctor.location}</span>
                </div>
                <p className="text-gray-700 leading-relaxed">{doctor.bio}</p>
              </div>
              
              <TabNavigation
                tabs={[
                  { id: 'about', label: 'About', icon: User },
                  { id: 'availability', label: 'Availability', icon: Calendar },
                  { id: 'reviews', label: 'Reviews', icon: Star, badge: doctor.reviews_count.toString() }
                ]}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                variant="underline"
                size="md"
              />
              
              <div className="mt-6">
                {activeTab === 'about' && (
                  <div className="space-y-6 animate-fade-in">
                    {/* Education */}
                    <div className="bg-white/50 rounded-xl p-4 border border-white/20 shadow-sm">
                      <div 
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => toggleSection('education')}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-blue-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-800">Education & Training</h3>
                        </div>
                        {expandedSections.education ? (
                          <ChevronUp className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                      
                      {(expandedSections.education || doctor.education.length <= 2) && (
                        <div className="mt-4 space-y-3 pl-14">
                          {doctor.education.map((edu, index) => (
                            <div key={index} className="flex items-start space-x-3">
                              <Check className="w-4 h-4 text-green-500 mt-1" />
                              <p className="text-gray-700">{edu}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Certifications */}
                    <div className="bg-white/50 rounded-xl p-4 border border-white/20 shadow-sm">
                      <div 
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => toggleSection('certifications')}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <Award className="w-5 h-5 text-green-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-800">Certifications</h3>
                        </div>
                        {expandedSections.certifications ? (
                          <ChevronUp className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                      
                      {(expandedSections.certifications || doctor.certifications.length <= 2) && (
                        <div className="mt-4 space-y-3 pl-14">
                          {doctor.certifications.map((cert, index) => (
                            <div key={index} className="flex items-start space-x-3">
                              <Check className="w-4 h-4 text-green-500 mt-1" />
                              <p className="text-gray-700">{cert}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Hospital Affiliations */}
                    <div className="bg-white/50 rounded-xl p-4 border border-white/20 shadow-sm">
                      <div 
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => toggleSection('affiliations')}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <Briefcase className="w-5 h-5 text-purple-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-800">Hospital Affiliations</h3>
                        </div>
                        {expandedSections.affiliations ? (
                          <ChevronUp className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                      
                      {(expandedSections.affiliations || doctor.hospital_affiliations.length <= 2) && (
                        <div className="mt-4 space-y-3 pl-14">
                          {doctor.hospital_affiliations.map((hospital, index) => (
                            <div key={index} className="flex items-start space-x-3">
                              <Check className="w-4 h-4 text-green-500 mt-1" />
                              <p className="text-gray-700">{hospital}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Languages */}
                    <div className="bg-white/50 rounded-xl p-4 border border-white/20 shadow-sm">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                          <Globe className="w-5 h-5 text-teal-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">Languages Spoken</h3>
                      </div>
                      
                      <div className="mt-4 pl-14 flex flex-wrap gap-2">
                        {doctor.languages_spoken.map((language, index) => (
                          <span 
                            key={index}
                            className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-sm"
                          >
                            {language}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'availability' && (
                  <div className="animate-fade-in">
                    <div className="bg-white/50 rounded-xl p-6 border border-white/20 shadow-sm mb-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Weekly Availability</h3>
                      <div className="grid grid-cols-7 gap-2">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                          const dayKey = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'][index] as keyof typeof doctor.availability_hours;
                          const dayData = doctor.availability_hours[dayKey];
                          
                          return (
                            <div key={day} className="text-center">
                              <div className="font-medium text-gray-700 mb-2">{day}</div>
                              <div className={`py-2 px-1 rounded-lg ${
                                dayData.available 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-400'
                              }`}>
                                {dayData.available 
                                  ? `${dayData.start} - ${dayData.end}` 
                                  : 'Unavailable'}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div className="bg-white/50 rounded-xl p-6 border border-white/20 shadow-sm">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-800">Book an Appointment</h3>
                        <div className="flex items-center space-x-2 text-teal-600">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            Next available in {timeUntilAvailable} hours
                          </span>
                        </div>
                      </div>
                      
                      {/* Date Selection */}
                      <div className="mb-6">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Select Date</h4>
                        <div className="flex space-x-2 overflow-x-auto pb-2">
                          {Array.from({ length: 7 }).map((_, index) => {
                            const date = new Date();
                            date.setDate(date.getDate() + index);
                            const isSelected = selectedDate.toDateString() === date.toDateString();
                            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                            const dayNum = date.getDate();
                            
                            return (
                              <button
                                key={index}
                                onClick={() => handleDateSelect(date)}
                                className={`flex-shrink-0 w-16 py-3 rounded-lg flex flex-col items-center transition-all ${
                                  isSelected 
                                    ? 'bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-lg' 
                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                <span className="text-xs font-medium">{dayName}</span>
                                <span className={`text-lg ${isSelected ? 'font-bold' : ''}`}>{dayNum}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      
                      {/* Time Slots */}
                      <div className="mb-6">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Select Time</h4>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                          {getAvailableTimeSlots(selectedDate).map((slot) => (
                            <button
                              key={slot}
                              onClick={() => handleTimeSlotSelect(slot)}
                              className={`py-2 px-3 rounded-lg text-center text-sm transition-all ${
                                selectedTimeSlot === slot
                                  ? 'bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-md'
                                  : 'bg-white text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              {slot}
                            </button>
                          ))}
                          
                          {getAvailableTimeSlots(selectedDate).length === 0 && (
                            <div className="col-span-full text-center py-4 text-gray-500">
                              No available slots on this day
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Consultation Type */}
                      <div className="mb-6">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Consultation Type</h4>
                        <div className="flex space-x-3">
                          {doctor.consultation_types.map(type => (
                            <button
                              key={type}
                              className="flex-1 py-3 px-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-all flex items-center justify-center space-x-2"
                            >
                              {type === 'video' ? (
                                <>
                                  <Video className="w-4 h-4 text-green-600" />
                                  <span>Video Call</span>
                                </>
                              ) : type === 'phone' ? (
                                <>
                                  <Phone className="w-4 h-4 text-blue-600" />
                                  <span>Phone Call</span>
                                </>
                              ) : (
                                <>
                                  <MapPin className="w-4 h-4 text-purple-600" />
                                  <span>In Person</span>
                                </>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Fee Information */}
                      <div className="bg-blue-50 rounded-lg p-4 mb-6 flex items-center justify-between">
                        <div>
                          <p className="text-sm text-blue-800">Consultation Fee</p>
                          <p className="text-xl font-bold text-blue-900">${doctor.consultation_fee}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-blue-800">Duration</p>
                          <p className="text-lg font-medium text-blue-900">30 minutes</p>
                        </div>
                      </div>
                      
                      {/* Book Button */}
                      <Button
                        variant="primary"
                        size="lg"
                        fullWidth
                        disabled={!selectedTimeSlot}
                        onClick={handleBookAppointment}
                        icon={Calendar}
                      >
                        Book Appointment
                      </Button>
                      
                      {!selectedTimeSlot && (
                        <p className="text-center text-sm text-gray-500 mt-2">
                          Please select a time slot to continue
                        </p>
                      )}
                    </div>
                  </div>
                )}
                
                {activeTab === 'reviews' && (
                  <div className="space-y-6 animate-fade-in">
                    {/* Reviews Summary */}
                    <div className="bg-white/50 rounded-xl p-6 border border-white/20 shadow-sm mb-6">
                      <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="text-center md:text-left">
                          <div className="text-5xl font-bold text-gray-800 mb-2">{doctor.rating}</div>
                          <div className="flex items-center justify-center md:justify-start mb-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-5 h-5 ${i < Math.floor(doctor.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                          <p className="text-gray-600">{doctor.reviews_count} reviews</p>
                        </div>
                        
                        <div className="flex-1 space-y-2">
                          {[5, 4, 3, 2, 1].map(rating => {
                            // Calculate percentage (mock data)
                            const percentage = rating === 5 ? 75 : 
                                              rating === 4 ? 20 : 
                                              rating === 3 ? 4 : 
                                              rating === 2 ? 1 : 0;
                            
                            return (
                              <div key={rating} className="flex items-center space-x-2">
                                <div className="flex items-center space-x-1 w-12">
                                  <span className="text-sm text-gray-700">{rating}</span>
                                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                </div>
                                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-yellow-400 rounded-full"
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm text-gray-600 w-12 text-right">{percentage}%</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    
                    {/* Review List */}
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <div key={review.id} className="bg-white/50 rounded-xl p-6 border border-white/20 shadow-sm">
                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                              {review.patient_avatar ? (
                                <img 
                                  src={review.patient_avatar} 
                                  alt={review.patient_name}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                  {review.patient_name.charAt(0)}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <h4 className="font-semibold text-gray-800">{review.patient_name}</h4>
                                  <div className="flex items-center space-x-2">
                                    <div className="flex">
                                      {Array.from({ length: 5 }).map((_, i) => (
                                        <Star 
                                          key={i} 
                                          className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                        />
                                      ))}
                                    </div>
                                    <span className="text-sm text-gray-500">
                                      {new Date(review.date).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                                
                                {review.is_verified && (
                                  <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                                    <Check className="w-3 h-3" />
                                    <span>Verified Visit</span>
                                  </div>
                                )}
                              </div>
                              
                              <p className="text-gray-700 mb-3">{review.comment}</p>
                              
                              <div className="flex items-center space-x-4">
                                <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-colors text-sm">
                                  <ThumbsUp className="w-4 h-4" />
                                  <span>Helpful ({review.helpful_count})</span>
                                </button>
                                <button className="text-gray-500 hover:text-blue-600 transition-colors text-sm">
                                  Reply
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <div className="text-center">
                        <Button variant="outline">
                          Load More Reviews
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Patients Helped</p>
                <p className="text-2xl font-bold text-gray-800">{doctor.patients_count}+</p>
              </div>
              <Users className="w-8 h-8 text-teal-500" />
            </div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Experience</p>
                <p className="text-2xl font-bold text-gray-800">{doctor.years_experience} years</p>
              </div>
              <Award className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Response Time</p>
                <p className="text-2xl font-bold text-gray-800">{doctor.response_time}</p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Consultation Fee</p>
                <p className="text-2xl font-bold text-gray-800">${doctor.consultation_fee}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>
        
        {/* Similar Doctors */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Similar Doctors</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/50 rounded-lg p-4 border border-white/20 hover:shadow-md transition-all duration-300 hover:scale-105">
                <div className="flex items-center space-x-3">
                  <img 
                    src={`https://images.pexels.com/photos/${1222271 + i}/pexels-photo-${1222271 + i}.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop`}
                    alt={`Doctor ${i}`}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-medium text-gray-800">Dr. John Smith</h3>
                    <p className="text-sm text-teal-600">{doctor.specialty}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600">4.8 (98)</span>
                  </div>
                  <Button variant="outline" size="sm">View Profile</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* FAQ Section */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { 
                question: "What insurance plans does Dr. Johnson accept?", 
                answer: "Dr. Johnson accepts most major insurance plans including Blue Cross Blue Shield, Aetna, Cigna, and Medicare. Please contact our office to verify your specific plan coverage." 
              },
              { 
                question: "How long is a typical appointment?", 
                answer: "Initial consultations are typically 45 minutes, while follow-up appointments are 30 minutes. Complex cases may require longer appointments." 
              },
              { 
                question: "What should I bring to my first appointment?", 
                answer: "Please bring your ID, insurance card, a list of current medications, and any relevant medical records or test results. If you have a referral, please bring that as well." 
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white/50 rounded-lg p-4 border border-white/20">
                <h3 className="font-medium text-gray-800 mb-2">{faq.question}</h3>
                <p className="text-gray-600 text-sm">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};