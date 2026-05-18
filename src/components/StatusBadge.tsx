import React from 'react';
import { StatusEquipamento, StatusEquipamentoColor, StatusEquipamentoLabel } from '../types';

interface Props {
  status: StatusEquipamento;
}

export function StatusBadge({ status }: Props) {
  return (
    <span className={`status-badge ${StatusEquipamentoColor[status]}`}>
      {StatusEquipamentoLabel[status] ?? 'Desconhecido'}
    </span>
  );
}
