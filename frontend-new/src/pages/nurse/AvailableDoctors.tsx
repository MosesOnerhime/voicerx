import { Search, UserCheck, ArrowRight } from "lucide-react";

const AvailableDoctors = () => {
  // Mock data based on PRD requirements
  const doctors = [
    { id: 1, name: "Dr. Moses Onerhime", specialty: "General Physician", nextPatient: "John Doe", room: "Consultation Room 1" },
    { id: 2, name: "Dr. Nebolisa Kosiso", specialty: "Cardiologist", nextPatient: "Sarah Ames", room: "Consultation Room 3" },
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold font-heading text-gray-900">Available Doctors</h1>
          <p className="text-gray-500 font-medium">Real-time status of clinical staff</p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or specialty..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#390C87] outline-none transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map((doc) => (
          <div key={doc.id} className="bg-white p-6 rounded-2xl shadow-card border border-transparent hover:border-[#390C87]/20 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center text-[#390C87]">
                <UserCheck size={24} />
              </div>
              <span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-1 rounded-md uppercase">Available</span>
            </div>
            
            <h3 className="font-bold text-lg text-gray-900">{doc.name}</h3>
            <p className="text-sm text-gray-500 mb-6">{doc.specialty} • {doc.room}</p>

            <div className="bg-tertiary p-4 rounded-xl border border-gray-100">
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Next Patient</p>
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-800">{doc.nextPatient}</span>
                <ArrowRight size={16} className="text-[#390C87] group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AvailableDoctors;