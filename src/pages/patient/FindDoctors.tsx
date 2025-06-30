import React, { useState } from 'react';
import { Search, MapPin, Star, Clock, DollarSign, Filter, Heart, Award, Users, Video, Phone, Calendar, MessageCircle, BookOpen } from 'lucide-react';

export const FindDoctors: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [showFilters, setShowFilters] = useState(false);

  const specialties = [
    'All Specialties',
    'Cardiology',
    'Dermatology',
    'General Practice',
    'Neurology',
    'Orthopedics',
    'Pediatrics',
    'Psychiatry'
  ];

  const doctors = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      specialty: 'Cardiology',
      rating: 4.9,
      reviews: 127,
      experience: 15,
      fee: 150,
      location: 'New York, NY',
      avatar: 'https://images.pexels.com/photos/559827/pexels-photo-559827.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      nextAvailable: 'Tomorrow 2:00 PM',
      education: ['Harvard Medical School', 'Johns Hopkins Residency'],
      languages: ['English', 'Spanish'],
      consultationTypes: ['video', 'in_person'],
      bio: 'Specialized in interventional cardiology with over 15 years of experience treating complex heart conditions.',
      verified: true,
      responseTime: '< 2 hours'
    },
    {
      id: 2,
      name: 'Dr. Michael Chen',
      specialty: 'General Practice',
      rating: 4.8,
      reviews: 89,
      experience: 12,
      fee: 120,
      location: 'Los Angeles, CA',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      nextAvailable: 'Dec 30, 10:00 AM',
      education: ['UCLA Medical School', 'Stanford Residency'],
      languages: ['English', 'Mandarin'],
      consultationTypes: ['video', 'phone', 'in_person'],
      bio: 'Family medicine physician focused on preventive care and chronic disease management.',
      verified: true,
      responseTime: '< 1 hour'
    },
    {
      id: 3,
      name: 'Dr. Emily Rodriguez',
      specialty: 'Pediatrics',
      rating: 4.9,
      reviews: 156,
      experience: 18,
      fee: 140,
      location: 'Chicago, IL',
      avatar: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      nextAvailable: 'Jan 2, 3:30 PM',
      education: ['Northwestern Medical School', 'Children\'s Hospital Residency'],
      languages: ['English', 'Spanish', 'French'],
      consultationTypes: ['video', 'in_person'],
      bio: 'Pediatric specialist with expertise in developmental disorders and childhood nutrition.',
      verified: true,
      responseTime: '< 30 minutes'
    },
    {
      id: 4,
      name: 'Dr. James Wilson',
      specialty: 'Dermatology',
      rating: 4.7,
      reviews: 203,
      experience: 20,
      fee: 180,
      location: 'Miami, FL',
      avatar: 'https://images.pexels.com/photos/612608/pexels-photo-612608.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      nextAvailable: 'Jan 3, 11:00 AM',
      education: ['University of Miami Medical School', 'Mayo Clinic Fellowship'],
      languages: ['English'],
      consultationTypes: ['video', 'in_person'],
      bio: 'Board-certified dermatologist specializing in skin cancer detection and cosmetic procedures.',
      verified: true,
      responseTime: '< 4 hours'
    }
  ];

  const getConsultationIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'phone':
        return <Phone className="w-4 h-4" />;
      case 'in_person':
        return <MapPin className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const getConsultationColor = (type: string) => {
    switch (type) {
      case 'video':
        return 'text-green-600 bg-green-50';
      case 'phone':
        return 'text-blue-600 bg-blue-50';
      case 'in_person':
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Find Doctors</h1>
          <p className="text-gray-600 mt-2">Discover qualified healthcare professionals near you</p>
        </div>
        <div className="bg-gradient-to-r from-teal-500 to-blue-500 text-white px-6 py-3 rounded-xl shadow-lg">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span className="font-semibold">{doctors.length} Doctors Available</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"
                placeholder="Search by doctor name, specialty, or condition"
              />
            </div>
          </div>

          {/* Specialty Filter */}
          <div>
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"
            >
              {specialties.map((specialty) => (
                <option key={specialty} value={specialty.toLowerCase().replace(' ', '_')}>
                  {specialty}
                </option>
              ))}
            </select>
          </div>

          {/* Advanced Filters Button */}
          <div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg hover:from-teal-600 hover:to-blue-600 transition-all"
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                >
                  <option value="all">All Locations</option>
                  <option value="new_york">New York, NY</option>
                  <option value="los_angeles">Los Angeles, CA</option>
                  <option value="chicago">Chicago, IL</option>
                  <option value="miami">Miami, FL</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                >
                  <option value="rating">Highest Rated</option>
                  <option value="experience">Most Experienced</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="availability">Earliest Available</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Type</label>
                <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/50">
                  <option value="all">All Types</option>
                  <option value="video">Video Call</option>
                  <option value="phone">Phone Call</option>
                  <option value="in_person">In Person</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/50">
                  <option value="all">Any Price</option>
                  <option value="0-100">$0 - $100</option>
                  <option value="100-150">$100 - $150</option>
                  <option value="150-200">$150 - $200</option>
                  <option value="200+">$200+</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {doctors.map((doctor) => (
          <div key={doctor.id} className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group">
            {/* Doctor Header */}
            <div className="flex items-start space-x-4 mb-4">
              <div className="relative">
                <img
                  src={doctor.avatar}
                  alt={doctor.name}
                  className="w-20 h-20 rounded-full object-cover ring-4 ring-white/50 group-hover:ring-teal-300 transition-all duration-300"
                />
                {doctor.verified && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                    <Award className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 group-hover:text-teal-600 transition-colors">
                      {doctor.name}
                    </h3>
                    <p className="text-teal-600 font-medium">{doctor.specialty}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="font-medium">{doctor.rating}</span>
                        <span>({doctor.reviews} reviews)</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{doctor.experience} years exp.</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-1 text-lg font-bold text-gray-800">
                      <DollarSign className="w-5 h-5" />
                      <span>{doctor.fee}</span>
                    </div>
                    <p className="text-xs text-gray-500">per consultation</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Doctor Details */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{doctor.location}</span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MessageCircle className="w-4 h-4" />
                <span>Responds in {doctor.responseTime}</span>
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <BookOpen className="w-4 h-4" />
                <span>{doctor.education[0]}</span>
              </div>

              <p className="text-sm text-gray-600 line-clamp-2">{doctor.bio}</p>
            </div>

            {/* Consultation Types */}
            <div className="flex flex-wrap gap-2 mb-4">
              {doctor.consultationTypes.map((type) => (
                <span
                  key={type}
                  className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getConsultationColor(type)}`}
                >
                  {getConsultationIcon(type)}
                  <span className="capitalize">{type.replace('_', ' ')}</span>
                </span>
              ))}
            </div>

            {/* Languages */}
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-sm text-gray-600">Languages:</span>
              <div className="flex flex-wrap gap-1">
                {doctor.languages.map((language) => (
                  <span
                    key={language}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                  >
                    {language}
                  </span>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  Next available: {doctor.nextAvailable}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button className="flex-1 bg-gradient-to-r from-teal-500 to-blue-500 text-white py-3 px-4 rounded-lg hover:from-teal-600 hover:to-blue-600 transition-all font-medium flex items-center justify-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Book Appointment</span>
              </button>
              <button className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all">
                View Profile
              </button>
              <button className="px-4 py-3 border border-teal-300 text-teal-600 rounded-lg hover:bg-teal-50 transition-all">
                <MessageCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center">
        <button className="bg-white/70 backdrop-blur-sm border border-white/20 text-gray-700 px-8 py-3 rounded-lg hover:bg-white/90 transition-all shadow-lg hover:shadow-xl">
          Load More Doctors
        </button>
      </div>

      {/* Quick Stats */}
      <div className="bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Why Choose Our Doctors?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Award className="w-6 h-6 text-teal-600" />
            </div>
            <h4 className="font-semibold text-gray-800">Verified Professionals</h4>
            <p className="text-sm text-gray-600 mt-1">All doctors are licensed and verified</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-800">Quick Response</h4>
            <p className="text-sm text-gray-600 mt-1">Average response time under 2 hours</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Heart className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-800">Patient Satisfaction</h4>
            <p className="text-sm text-gray-600 mt-1">98% patient satisfaction rate</p>
          </div>
        </div>
      </div>
    </div>
  );
};