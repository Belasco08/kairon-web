import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, CheckCircle, Calendar, Clock, User, Scissors } from 'lucide-react';

// ==============================================================================
// 1. DEFINIÇÃO DE TIPOS (Resolvendo o erro "Unexpected any")
// ==============================================================================
interface IService {
  id: string;
  name: string;
  duration: number;
  price: number;
}

interface IProfessional {
  id: string;
  name: string;
  avatar?: string;
}

type Step = 'SERVICE' | 'PROFESSIONAL' | 'DATETIME' | 'CONFIRM' | 'SUCCESS';

// ==============================================================================
// CONFIGURAÇÃO DA API
// ==============================================================================
const api = axios.create({
  baseURL: 'https://kairon-api.onrender.com'
});

export function Booking() {
  const { companyId } = useParams();
  const [step, setStep] = useState<Step>('SERVICE');
  const [loading, setLoading] = useState(false);

  // Estados com Tipagem Correta
  const [services, setServices] = useState<IService[]>([]);
  const [professionals, setProfessionals] = useState<IProfessional[]>([]);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);

  // Estados de Seleção com Tipagem
  const [selectedService, setSelectedService] = useState<IService | null>(null);
  const [selectedPro, setSelectedPro] = useState<IProfessional | null>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');

  // ==============================================================================
  // FETCH DE DADOS
  // ==============================================================================
  useEffect(() => {
    if (companyId) {
        api.get(`/public/services/${companyId}`)
           .then(res => setServices(res.data))
           .catch(err => console.error("Erro ao buscar serviços", err));
    }
  }, [companyId]);

  useEffect(() => {
      if (companyId && step === 'PROFESSIONAL') {
          api.get(`/public/professionals/${companyId}`)
             .then(res => setProfessionals(res.data))
             .catch(err => console.error("Erro ao buscar profissionais", err));
      }
  }, [companyId, step]);

  useEffect(() => {
      if (selectedPro && date) {
          api.get('/public/availability', {
              params: {
                  professionalId: selectedPro.id,
                  date: date
              }
          })
          .then(res => setTimeSlots(res.data))
          .catch(err => console.error("Erro ao buscar horários", err));
      }
  }, [selectedPro, date]);

  // ==============================================================================
  // AÇÕES
  // ==============================================================================
  function handleBack() {
    if (step === 'PROFESSIONAL') setStep('SERVICE');
    if (step === 'DATETIME') setStep('PROFESSIONAL');
    if (step === 'CONFIRM') setStep('DATETIME');
  }

  async function handleConfirm() {
    if (!clientName || !clientPhone) return alert('Por favor, preencha seus dados!');
    if (!selectedService || !selectedPro) return alert('Dados incompletos!');
    
    setLoading(true);
    
    try {
        await api.post('/public/appointments', {
            companyId,
            serviceId: selectedService.id,
            professionalId: selectedPro.id,
            date,
            time, 
            clientName,
            clientPhone
        });

        setStep('SUCCESS');
    } catch (error) {
        console.error(error);
        alert('Erro ao realizar agendamento. Tente novamente.');
    } finally {
        setLoading(false);
    }
  }

  // ==============================================================================
  // RENDER: TELA DE SUCESSO VIP
  // ==============================================================================
  if (step === 'SUCCESS') {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mb-6 border-2 border-[#D4AF37] animate-bounce">
          <CheckCircle className="text-[#D4AF37] w-12 h-12" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Horário Reservado!</h1>
        <p className="text-[#D4AF37] font-medium text-lg">Te aguardamos no estabelecimento, {clientName.split(' ')[0]}.</p>
        
        <div className="mt-8 bg-slate-800 p-6 rounded-2xl shadow-xl w-full max-w-sm text-left border border-slate-700">
            <div className="flex justify-between mb-4 border-b border-slate-700 pb-3">
                <span className="text-slate-400">Serviço</span>
                <span className="font-bold text-white">{selectedService?.name}</span>
            </div>
            <div className="flex justify-between mb-4 border-b border-slate-700 pb-3">
                <span className="text-slate-400">Profissional</span>
                <span className="font-bold text-white">{selectedPro?.name}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-slate-400">Data e Hora</span>
                <span className="font-bold text-[#D4AF37]">{date.split('-').reverse().join('/')} às {time}</span>
            </div>
        </div>
      </div>
    );
  }

  // ==============================================================================
  // RENDER: FLUXO DE AGENDAMENTO
  // ==============================================================================
  return (
    <div className="min-h-screen bg-slate-900 pb-20 text-slate-200">
      
      {/* HEADER FIXO PREMIUM */}
      <header className="bg-slate-900/80 backdrop-blur-md p-5 sticky top-0 z-10 border-b border-slate-800 shadow-sm">
        <div className="flex items-center gap-3 max-w-md mx-auto">
            {step !== 'SERVICE' && (
                <button onClick={handleBack} className="p-2 -ml-2 hover:bg-slate-800 rounded-full transition-colors">
                    <ChevronLeft className="text-[#D4AF37]" />
                </button>
            )}
            <div>
                <h1 className="font-bold text-white text-lg tracking-wide uppercase">Agendamento</h1>
                <p className="text-xs text-[#D4AF37] font-semibold tracking-widest uppercase">
                    Passo {step === 'SERVICE' ? 1 : step === 'PROFESSIONAL' ? 2 : step === 'DATETIME' ? 3 : 4} de 4
                </p>
            </div>
        </div>
      </header>

      <main className="max-w-md mx-auto p-5 mt-4">
        
        {/* PASSO 1: SERVIÇOS */}
        {step === 'SERVICE' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-2xl font-bold text-white mb-6">O que vamos fazer hoje?</h2>
                
                {services.length === 0 && <p className="text-slate-400">Buscando catálogo de serviços...</p>}

                {services.map(service => (
                    <button 
                        key={service.id}
                        onClick={() => { setSelectedService(service); setStep('PROFESSIONAL'); }}
                        className="w-full bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-lg flex justify-between items-center hover:border-[#D4AF37] hover:bg-slate-800/80 transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center text-[#D4AF37] border border-slate-700 group-hover:bg-[#D4AF37] group-hover:text-slate-900 transition-colors">
                                <Scissors size={20} />
                            </div>
                            <div className="text-left">
                                <span className="block font-bold text-white text-lg">{service.name}</span>
                                <span className="text-sm text-slate-400">{service.duration} min</span>
                            </div>
                        </div>
                        <span className="font-bold text-[#D4AF37] text-lg">R$ {service.price}</span>
                    </button>
                ))}
            </div>
        )}

        {/* PASSO 2: PROFISSIONAL */}
        {step === 'PROFESSIONAL' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-2xl font-bold text-white mb-6">Escolha o especialista</h2>

                {professionals.length === 0 && <p className="text-slate-400">Carregando equipe...</p>}

                {professionals.map(pro => (
                    <button 
                        key={pro.id}
                        onClick={() => { setSelectedPro(pro); setStep('DATETIME'); }}
                        className="w-full bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow-lg flex items-center gap-4 hover:border-[#D4AF37] transition-all group"
                    >
                        <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center text-[#D4AF37] font-bold text-xl border border-slate-700 group-hover:bg-[#D4AF37] group-hover:text-slate-900 transition-colors">
                            {pro.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-left">
                            <span className="block font-bold text-white text-xl">{pro.name}</span>
                            <span className="text-sm text-slate-400">Profissional</span>
                        </div>
                    </button>
                ))}
            </div>
        )}

        {/* PASSO 3: DATA E HORA */}
        {step === 'DATETIME' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-4">Selecione a Data</h2>
                    {/* Estilização nativa para input date dark mode */}
                    <input 
                        type="date" 
                        className="w-full p-4 bg-slate-800 border border-slate-700 rounded-xl text-white text-lg outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent color-scheme-dark"
                        style={{ colorScheme: 'dark' }} 
                        onChange={(e) => setDate(e.target.value)}
                    />
                </div>

                {date && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-2xl font-bold text-white mb-4">Horários Livres</h2>
                        
                        {timeSlots.length === 0 ? (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-center text-red-400">
                                Sem horários disponíveis para esta data.
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-3">
                                {timeSlots.map(slot => (
                                    <button
                                        key={slot}
                                        onClick={() => { setTime(slot); setStep('CONFIRM'); }}
                                        className="py-4 px-2 bg-slate-800 border border-slate-700 rounded-xl font-bold text-slate-300 hover:bg-[#D4AF37] hover:text-slate-900 hover:border-[#D4AF37] transition-all shadow-sm text-lg"
                                    >
                                        {slot}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        )}

        {/* PASSO 4: CONFIRMAÇÃO */}
        {step === 'CONFIRM' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 text-white p-6 rounded-2xl shadow-xl">
                    <h2 className="text-xl font-bold mb-6 text-[#D4AF37] uppercase tracking-wider text-center">Resumo da Reserva</h2>
                    
                    <div className="space-y-4 text-slate-300">
                        <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-lg">
                            <Scissors size={20} className="text-[#D4AF37]" />
                            <span className="font-semibold text-white">{selectedService?.name}</span>
                        </div>
                        <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-lg">
                            <User size={20} className="text-[#D4AF37]" />
                            <span className="font-semibold text-white">{selectedPro?.name}</span>
                        </div>
                        <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-lg">
                            <Calendar size={20} className="text-[#D4AF37]" />
                            <span className="font-semibold text-white">{date.split('-').reverse().join('/')}</span>
                        </div>
                        <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-lg">
                            <Clock size={20} className="text-[#D4AF37]" />
                            <span className="font-semibold text-white">{time}</span>
                        </div>
                        
                        <div className="pt-4 mt-2 border-t border-slate-700 flex justify-between items-center text-white">
                            <span className="text-slate-400 uppercase tracking-widest text-xs font-bold">Total a pagar no local</span>
                            <span className="font-bold text-2xl text-[#D4AF37]">R$ {selectedService?.price}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 pt-4">
                    <h3 className="font-bold text-white text-lg">Seus dados para contato</h3>
                    
                    {/* Usando inputs nativos para garantir a aderência ao tema sem depender dos componentes UI antigos */}
                    <input 
                        placeholder="Como podemos te chamar?" 
                        value={clientName}
                        onChange={e => setClientName(e.target.value)}
                        className="w-full p-4 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all"
                    />
                    <input 
                        placeholder="Seu WhatsApp (DD) 99999-9999" 
                        type="tel"
                        value={clientPhone}
                        onChange={e => setClientPhone(e.target.value)}
                        className="w-full p-4 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all"
                    />
                </div>

                <div className="pt-6">
                    <button 
                        onClick={handleConfirm} 
                        disabled={loading}
                        className="w-full bg-[#D4AF37] text-slate-900 font-bold text-lg p-4 rounded-xl shadow-[0_4px_14px_0_rgba(212,175,55,0.39)] hover:bg-[#B8860B] transition-all disabled:opacity-50 flex justify-center"
                    >
                        {loading ? 'Confirmando...' : 'FINALIZAR AGENDAMENTO'}
                    </button>
                </div>
            </div>
        )}

      </main>
    </div>
  );
}