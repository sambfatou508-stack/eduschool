import React, { useState } from 'react';
import { HeartHandshake, Phone, MessageSquare, Mail, MapPin, Briefcase, Search, UserCheck } from 'lucide-react';
import { Parent, Student } from '../../types';

interface ParentsModuleProps {
  parents: Parent[];
  students: Student[];
  onOpenReportCard?: (student: Student) => void;
}

export const ParentsModule: React.FC<ParentsModuleProps> = ({ 
  parents, 
  students,
  onOpenReportCard
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredParents = parents.filter(p => 
    p.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone.includes(searchTerm) ||
    p.profession.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Répertoire des Parents & Tuteurs Légaux
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Contacts directs, messagerie WhatsApp et suivi des élèves rattachés
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Rechercher par nom, profession, tél..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white"
          />
        </div>
      </div>

      {/* Parents Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredParents.map((parent) => {
          // Find linked children
          const linkedChildren = students.filter(s => 
            parent.studentIds?.includes(s.id) || s.parentId === parent.id || s.parentPhone === parent.phone
          );

          return (
            <div 
              key={parent.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-slate-100 text-slate-700 font-black flex items-center justify-center text-sm border border-slate-200">
                    {parent.firstName[0]}{parent.lastName[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{parent.firstName} {parent.lastName}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Briefcase className="w-3 h-3 text-slate-400" />
                      {parent.profession}
                    </p>
                  </div>
                </div>

                <a 
                  href={`https://wa.me/${parent.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                  title="Écrire sur WhatsApp"
                >
                  <MessageSquare className="w-4 h-4" />
                </a>
              </div>

              {/* Coordinates */}
              <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Téléphone (+221) :</span>
                  <a href={`tel:${parent.phone}`} className="font-semibold text-slate-800 hover:text-blue-600 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-emerald-600" />
                    {parent.phone}
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Email :</span>
                  <span className="font-semibold text-slate-800 truncate max-w-[170px]">{parent.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Domicile :</span>
                  <span className="font-medium text-slate-700 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {parent.address}
                  </span>
                </div>
              </div>

              {/* Linked Children */}
              <div className="pt-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Élève(s) rattaché(s) ({linkedChildren.length})
                </span>
                <div className="space-y-1.5">
                  {linkedChildren.length > 0 ? (
                    linkedChildren.map(child => (
                      <div 
                        key={child.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-blue-50/60 border border-blue-100/80 text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-800">{child.firstName} {child.lastName}</span>
                          <span className="text-[11px] text-blue-600 ml-2 font-medium">({child.className})</span>
                        </div>
                        {onOpenReportCard && (
                          <button
                            onClick={() => onOpenReportCard(child)}
                            className="text-[11px] text-blue-700 font-bold hover:underline"
                          >
                            Bulletin
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">Aucun élève associé</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
