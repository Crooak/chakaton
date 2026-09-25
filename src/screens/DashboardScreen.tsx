import { Plus, Search } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import StageBadge from '../components/StageBadge';
import Button from '../components/Button';
import { objects, dashboardSummary, processStatusLabels } from '../mocks/data';

interface Props {
  onOpenObject: (objectId: string) => void;
}

const indicatorColor: Record<'green' | 'yellow' | 'red', string> = {
  green: '#12B76A',
  yellow: '#F79009',
  red:   '#B42318'
};

function StatTile({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex-1 bg-white border border-[#E2E8F0] rounded-lg px-4 py-3 flex flex-col gap-1">
      <span className="text-[12px] text-[#475569]">{label}</span>
      <span className="text-[28px] leading-9 font-semibold text-[#0F172A] num">{value}</span>
    </div>
  );
}

function CompletenessDot({ v }: { v: 'full' | 'partial' | 'missing' }) {
  const c = v === 'full' ? '#12B76A' : v === 'partial' ? '#F79009' : '#CBD5E1';
  return <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: c }} aria-hidden />;
}

export default function DashboardScreen({ onOpenObject }: Props) {
  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#F5F7FA]">
      <PageHeader
        crumbs={['Главная', 'Объекты']}
        title="Объекты"
        actions={
          <>
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                aria-hidden
              />
              <input
                aria-label="Поиск по объектам"
                placeholder="Поиск по объектам"
                className="h-9 w-72 pl-8 pr-3 border border-[#CBD5E1] rounded-md bg-white text-[13px] outline-none focus:border-[#1B4E9B]"
              />
            </div>
            <Button variant="primary" size="md" icon={<Plus size={14} />}>
              Новая проверка
            </Button>
          </>
        }
      />

      <div className="flex-1 overflow-auto px-8 py-5">
        {/* Сводка */}
        <div className="flex gap-4 mb-5">
          <StatTile label="Объектов в работе"                 value={dashboardSummary.objectsInWork} />
          <StatTile label="Протоколов ожидают верификации"    value={dashboardSummary.awaitingVerification} />
          <StatTile label="Кандидатов к рассмотрению"         value={dashboardSummary.candidatesToReview} />
          <StatTile label="Финализировано за месяц"           value={dashboardSummary.finalizedThisMonth} />
        </div>

        {/* Фильтры */}
        <div className="flex items-center gap-3 mb-4">
          <select className="h-9 px-3 border border-[#CBD5E1] rounded-md bg-white text-[13px] text-[#475569] outline-none focus:border-[#1B4E9B]">
            <option>Раздел ПД: все</option>
            <option>АР</option><option>КР</option><option>ОВ</option><option>ВК</option>
          </select>
          <select className="h-9 px-3 border border-[#CBD5E1] rounded-md bg-white text-[13px] text-[#475569] outline-none focus:border-[#1B4E9B]">
            <option>Статус: все</option>
            <option>Готов к верификации</option>
            <option>Верификация</option>
            <option>Финализирован</option>
          </select>
          <select className="h-9 px-3 border border-[#CBD5E1] rounded-md bg-white text-[13px] text-[#475569] outline-none focus:border-[#1B4E9B]">
            <option>Приоритет: все</option>
            <option>HIGH</option><option>MEDIUM</option><option>LOW</option>
          </select>
        </div>

        {/* Таблица */}
        <div className="bg-white border border-[#E2E8F0] rounded-lg overflow-hidden">
          <table className="w-full text-[13px] border-collapse">
            <thead>
              <tr className="bg-[#EDF1F7] text-[#475569] text-[12px]">
                <th className="w-1" aria-hidden />
                <th className="text-left font-medium px-3 h-10">Объект</th>
                <th className="text-left font-medium px-3 h-10 w-[200px]">Застройщик</th>
                <th className="text-left font-medium px-3 h-10 w-[130px]">Комплектность</th>
                <th className="text-left font-medium px-3 h-10 w-[170px]">Статус процесса</th>
                <th className="text-right font-medium px-3 h-10 w-[110px]">Кандидатов</th>
                <th className="text-right font-medium px-3 h-10 w-[110px]">Подтверждено</th>
                <th className="text-left font-medium px-3 h-10 w-[150px]">Обновлён</th>
              </tr>
            </thead>
            <tbody>
              {objects.map((o) => (
                <tr
                  key={o.id}
                  className="h-10 border-t border-[#E2E8F0] hover:bg-[#E8F0FB] cursor-pointer"
                  onClick={() => onOpenObject(o.id)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onOpenObject(o.id);
                    }
                  }}
                >
                  <td className="p-0">
                    <span
                      className="block w-1 h-10"
                      style={{ background: indicatorColor[o.indicator] }}
                      aria-hidden
                    />
                  </td>
                  <td className="px-3">
                    <div className="flex flex-col leading-tight">
                      <span className="text-[#0F172A] font-medium">{o.name}</span>
                      <span className="text-[11px] text-[#94A3B8]">{o.address}</span>
                    </div>
                  </td>
                  <td className="px-3 text-[#475569]">{o.developer}</td>
                  <td className="px-3">
                    <div className="flex items-center gap-2">
                      <CompletenessDot v={o.completeness.PD} />
                      <StageBadge stage="PD" active={o.completeness.PD !== 'missing'} />
                      <CompletenessDot v={o.completeness.RD} />
                      <StageBadge stage="RD" active={o.completeness.RD !== 'missing'} />
                      <CompletenessDot v={o.completeness.ID} />
                      <StageBadge stage="ID" active={o.completeness.ID !== 'missing'} />
                    </div>
                  </td>
                  <td className="px-3 text-[#475569]">{processStatusLabels[o.processStatus]}</td>
                  <td className="px-3 text-right num text-[#0F172A]">{o.candidates}</td>
                  <td className="px-3 text-right num text-[#0F172A]">{o.confirmed}</td>
                  <td className="px-3 text-[#475569] mono text-[12px]">{o.updatedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}