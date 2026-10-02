import React, { useState } from 'react';
import { 
  Users, 
  Phone, 
  BookOpen, 
  Calendar, 
  Clock, 
  Plus, 
  CheckCircle2, 
  Search,
  Building
} from 'lucide-react';
import { Teacher } from '../../types';

interface TeachersModuleProps {
  teachers: Teacher[];
}

export const TeachersModule: React.FC<TeachersModuleProps> = ({ teachers }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTeachers = teachers.filter(t => {
    const specialtyStr = t.specialty || (t.subjects ? t.subjects.join(' ') : '');
    return (
      t.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      specialtyStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.phone.includes(searchTerm)
    );
  });


  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Corps Enseignant & Personnel Pédagogique
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {teachers.length} professeurs qualifiés sous contrat pour l'année 2026-2027
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Rechercher un professeur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white"
          />
        </div>
      </div>

      {/* Teachers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTeachers.map((teacher) => (
          <div 
            key={teacher.id}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-700 to-blue-800 text-white font-black flex items-center justify-center text-sm shadow-md">
                {teacher.firstName[0]}{teacher.lastName[0]}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{teacher.firstName} {teacher.lastName}</h3>
                <p className="text-xs text-blue-700 font-semibold">{teacher.specialty || teacher.subjects?.join(', ') || 'Discipline Générale'}</p>
                <p className="text-[11px] text-slate-400 font-mono">{teacher.matricule}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Téléphone (+221) :</span>
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-emerald-600" />
                  {teacher.phone}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Volume Horaire :</span>
                <span className="font-bold text-slate-800">{teacher.weeklyHours || 18}h / semaine</span>
              </div>
              <div className="pt-1 border-t border-slate-200">
                <span className="text-slate-400 block mb-1">Classes assignées :</span>
                <div className="flex flex-wrap gap-1">
                  {(teacher.assignedClasses || teacher.classNames || ['6ème A']).map((cls, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800 font-semibold text-[11px]">
                      {cls}
                    </span>
                  ))}
                </div>
              </div>
            </div>


            <div className="flex items-center justify-between text-xs pt-1">
              <span className="flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Contrat Actif
              </span>
              <a
                href={`https://wa.me/${teacher.phone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 transition-colors"
              >
                WhatsApp
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
