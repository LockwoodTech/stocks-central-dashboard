import { useState } from 'react';
import { Target } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { useCreateGoal } from '@/hooks/useGoals';
import type { CreateGoalRequest } from '@/types';

interface CreateGoalModalProps {
  open: boolean;
  onClose: () => void;
}

const inputClass =
  'w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none';

const labelClass = 'block text-sm font-medium text-foreground mb-1';

export default function CreateGoalModal({
  open,
  onClose,
}: CreateGoalModalProps) {
  const createGoal = useCreateGoal();

  const [name, setName] = useState('');
  const [goalType, setGoalType] = useState<'Fund' | 'Shares'>('Fund');
  const [targetAmount, setTargetAmount] = useState<number | ''>('');
  const [monthlyTarget, setMonthlyTarget] = useState<number | ''>('');
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [targetDate, setTargetDate] = useState('');
  const [expectedReturnPercent, setExpectedReturnPercent] = useState<number>(8);

  function resetForm() {
    setName('');
    setGoalType('Fund');
    setTargetAmount('');
    setMonthlyTarget('');
    setStartDate(new Date().toISOString().split('T')[0]);
    setTargetDate('');
    setExpectedReturnPercent(8);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const payload: CreateGoalRequest = {
      name,
      type: goalType,
      targetAmount: Number(targetAmount),
      monthlyTarget: Number(monthlyTarget),
      startDate,
      targetDate,
      expectedReturnPercent,
    };

    await createGoal.mutateAsync(payload);

    resetForm();
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create Investment Goal"
      className="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Goal Name */}
        <div>
          <label className={labelClass}>Goal Name</label>
          <input
            type="text"
            className={inputClass}
            placeholder="e.g. Retirement Fund, House Down Payment"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* Goal Type */}
        <div>
          <label className={labelClass}>Goal Type</label>
          <select
            className={inputClass}
            value={goalType}
            onChange={(e) => setGoalType(e.target.value as 'Fund' | 'Shares')}
          >
            <option value="Fund">Fund</option>
            <option value="Shares">Shares</option>
          </select>
        </div>

        {/* Target Amount */}
        <div>
          <label className={labelClass}>Target Amount (TZS)</label>
          <input
            type="number"
            className={inputClass}
            placeholder="0"
            min={0}
            value={targetAmount}
            onChange={(e) =>
              setTargetAmount(e.target.value ? Number(e.target.value) : '')
            }
            required
          />
        </div>

        {/* Monthly Investment Target */}
        <div>
          <label className={labelClass}>Monthly Investment Target (TZS)</label>
          <input
            type="number"
            className={inputClass}
            placeholder="0"
            min={0}
            value={monthlyTarget}
            onChange={(e) =>
              setMonthlyTarget(e.target.value ? Number(e.target.value) : '')
            }
            required
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Start Date</label>
            <input
              type="date"
              className={inputClass}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Target Date</label>
            <input
              type="date"
              className={inputClass}
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Expected Annual Return */}
        <div>
          <label className={labelClass}>Expected Annual Return (%)</label>
          <input
            type="number"
            className={inputClass}
            placeholder="8"
            min={0}
            max={100}
            step="0.1"
            value={expectedReturnPercent}
            onChange={(e) =>
              setExpectedReturnPercent(Number(e.target.value))
            }
          />
        </div>

        {/* Footer */}
        <div className="flex gap-3">
          <Button
            type="submit"
            loading={createGoal.isPending}
            className="flex-1"
          >
            <Target className="h-4 w-4" />
            Create Goal
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
