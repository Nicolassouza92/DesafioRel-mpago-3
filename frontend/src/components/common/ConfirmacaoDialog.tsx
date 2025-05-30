import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
} from '@mui/material';

interface ConfirmacaoDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  contentText: string | React.ReactNode; // Permite JSX no conteúdo
  confirmButtonText?: string;
  cancelButtonText?: string;
  isConfirming?: boolean; // Para mostrar loading no botão de confirmar
}

const ConfirmacaoDialog: React.FC<ConfirmacaoDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  contentText,
  confirmButtonText = 'Confirmar',
  cancelButtonText = 'Cancelar',
  isConfirming = false,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="confirmacao-dialog-title"
      aria-describedby="confirmacao-dialog-description"
    >
      <DialogTitle id="confirmacao-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText component="div" id="confirmacao-dialog-description"> {/* component="div" para permitir ReactNode */}
          {contentText}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isConfirming} color="inherit">
          {cancelButtonText}
        </Button>
        <Button onClick={onConfirm} color="primary" disabled={isConfirming} autoFocus>
          {isConfirming ? <CircularProgress size={22} color="inherit" /> : confirmButtonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmacaoDialog;