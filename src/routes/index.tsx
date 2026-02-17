import { Routes, Route } from 'react-router-dom';
import { Booking } from '../pages/Booking';

export function AppRoutes() {
  return (
    <Routes>
      {/* Rota pública de agendamento */}
      <Route path="/agendar/:companyId" element={<Booking />} />
      
      {/* Rota padrão (se acessar a raiz sem ID) */}
      <Route path="*" element={
        <div className="h-screen flex items-center justify-center text-slate-500">
          Página não encontrada. Use o link fornecido pela barbearia.
        </div>
      } />
    </Routes>
  );
}