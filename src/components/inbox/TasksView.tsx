import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TaskItem } from '../../types';
import {
  CalendarCheck2,
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  User,
  Tag,
  AlertTriangle,
} from 'lucide-react';
import { formatDateBR } from '../../utils/formatters';

export const TasksView: React.FC = () => {
  const { tasks, addTask, updateTask, showToast } = useApp();

  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Formulário de nova tarefa
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<TaskItem['priority']>('medium');
  const [category, setCategory] = useState<TaskItem['category']>('Documental');
  const [assignedTo, setAssignedTo] = useState('Operador LSA');

  const filteredTasks = tasks.filter((t) => {
    if (filterStatus === 'pending') return t.status !== 'completed';
    if (filterStatus === 'completed') return t.status === 'completed';
    return true;
  });

  const handleToggleComplete = (task: TaskItem) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    updateTask(task.id, { status: newStatus });
    showToast(newStatus === 'completed' ? 'Tarefa concluída!' : 'Tarefa reaberta.');
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) {
      showToast('Preencha o título e o prazo da tarefa.');
      return;
    }

    addTask({
      title,
      dueDate,
      priority,
      category,
      assignedTo,
      status: 'pending',
    });

    setTitle('');
    setDueDate('');
    setIsModalOpen(false);
  };

  const getPriorityBadge = (p: TaskItem['priority']) => {
    switch (p) {
      case 'urgent':
        return { label: 'Urgente', bg: '#FEE2E2', text: '#991B1B' };
      case 'high':
        return { label: 'Alta', bg: '#FEF3C7', text: '#92400E' };
      case 'medium':
        return { label: 'Média', bg: '#EFF6FF', text: '#1E40AF' };
      default:
        return { label: 'Baixa', bg: '#F3F4F6', text: '#4B5563' };
    }
  };

  return (
    <div className="content-container">
      {/* Cabeçalho */}
      <div className="view-header">
        <div>
          <h1 className="view-title">Agenda & Tarefas Administrativas</h1>
          <p className="view-subtitle">
            Gestão de rotinas do backoffice LSA: protocolos, assinaturas de contratos, conciliações e pendências com o produtor.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} strokeWidth={2.5} />
          <span>Nova Tarefa</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="tabs-container" style={{ marginBottom: '20px' }}>
        <button
          className={`tab-btn ${filterStatus === 'all' ? 'active' : ''}`}
          onClick={() => setFilterStatus('all')}
        >
          Todas ({tasks.length})
        </button>
        <button
          className={`tab-btn ${filterStatus === 'pending' ? 'active' : ''}`}
          onClick={() => setFilterStatus('pending')}
        >
          Pendentes ({tasks.filter((t) => t.status !== 'completed').length})
        </button>
        <button
          className={`tab-btn ${filterStatus === 'completed' ? 'active' : ''}`}
          onClick={() => setFilterStatus('completed')}
        >
          Concluídas ({tasks.filter((t) => t.status === 'completed').length})
        </button>
      </div>

      {/* Lista de Tarefas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredTasks.map((task) => {
          const isDone = task.status === 'completed';
          const pBadge = getPriorityBadge(task.priority);

          return (
            <div
              key={task.id}
              className="card"
              style={{
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                opacity: isDone ? 0.7 : 1,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                <button
                  onClick={() => handleToggleComplete(task)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: isDone ? '#16A34A' : '#9CA3AF',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0,
                  }}
                  title={isDone ? 'Marcar como pendente' : 'Concluir tarefa'}
                >
                  {isDone ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                </button>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '14.5px',
                        fontWeight: 600,
                        color: 'var(--text-main)',
                        textDecoration: isDone ? 'line-through' : 'none',
                      }}
                    >
                      {task.title}
                    </span>
                    <span
                      style={{
                        backgroundColor: pBadge.bg,
                        color: pBadge.text,
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 7px',
                        borderRadius: '10px',
                      }}
                    >
                      {pBadge.label}
                    </span>
                    <span
                      style={{
                        backgroundColor: '#F3F4F6',
                        color: '#4B5563',
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '10px',
                      }}
                    >
                      {task.category}
                    </span>
                  </div>

                  <div
                    style={{
                      fontSize: '12px',
                      color: 'var(--text-subtle)',
                      marginTop: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={13} />
                      Prazo: <strong>{formatDateBR(task.dueDate)}</strong>
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <User size={13} />
                      Responsável: {task.assignedTo}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Nova Tarefa */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Nova Tarefa Administrativa</h3>
              <button className="btn-icon" onClick={() => setIsModalOpen(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleCreateTask}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Título da Tarefa</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: Assinar aditivo do contrato de arrendamento"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Data Limite (Prazo)</label>
                    <input
                      type="date"
                      className="form-input"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Prioridade</label>
                    <select
                      className="form-select"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                    >
                      <option value="low">Baixa</option>
                      <option value="medium">Média</option>
                      <option value="high">Alta</option>
                      <option value="urgent">Urgente</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Natureza / Categoria</label>
                    <select
                      className="form-select"
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                    >
                      <option value="Documental">Documental</option>
                      <option value="Contratual">Contratual</option>
                      <option value="Financeira">Financeira</option>
                      <option value="Cadastral">Cadastral</option>
                      <option value="Operacional">Operacional</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Responsável</label>
                    <select
                      className="form-select"
                      value={assignedTo}
                      onChange={(e) => setAssignedTo(e.target.value)}
                    >
                      <option value="Operador LSA">Operador LSA</option>
                      <option value="Validador LSA">Validador LSA</option>
                      <option value="Gestor LSA">Gestor LSA</option>
                      <option value="Produtor Roberto">Produtor Roberto</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Salvar Tarefa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
