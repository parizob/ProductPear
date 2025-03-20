import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Grid,
  Collapse,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ListItemIcon,
  Slide,
  Fade,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import CloseIcon from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';
import Menu from '@mui/material/Menu';
import Checkbox from '@mui/material/Checkbox';
import CheckIcon from '@mui/icons-material/Check';
import { UseCase } from './types/UseCase';

const defaultStatusColors = {
  'Not Started': '#e0e0e0',
  'Grooming': '#bbdefb',
  'Development': '#fff9c4',
  'UAT': '#ffe0b2',
  'PRD': '#c8e6c9',
  'Blocked': '#ffcdd2',
};

function App() {
  const [useCases, setUseCases] = useState<UseCase[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusOptions, setStatusOptions] = useState<string[]>(Object.keys(defaultStatusColors));
  const [statusColors, setStatusColors] = useState<Record<string, string>>(defaultStatusColors);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(statusOptions);
  const [isManageMode, setIsManageMode] = useState(false);
  const [newUseCase, setNewUseCase] = useState<Partial<UseCase>>({
    name: '',
    description: '',
    status: 'Not Started',
    dataScienceDeveloper: '',
    dataScienceManager: '',
    techProductManager: '',
    mle: '',
  });
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [newStatusColor, setNewStatusColor] = useState('#e0e0e0');
  const [editingStatus, setEditingStatus] = useState<string | null>(null);
  const [statusSelectOpen, setStatusSelectOpen] = useState(false);
  const [showEntryForm, setShowEntryForm] = useState(true);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const filterOpen = Boolean(filterAnchorEl);
  const [showStatusFilters, setShowStatusFilters] = useState(false);
  const [showTPMFilters, setShowTPMFilters] = useState(false);
  const [selectedTPMs, setSelectedTPMs] = useState<string[]>([]);
  const [editingUseCase, setEditingUseCase] = useState<UseCase | null>(null);
  const [editingField, setEditingField] = useState<{id: string, field: keyof UseCase} | null>(null);
  const [editValue, setEditValue] = useState('');
  const editFieldRef = useRef<HTMLDivElement>(null);
  const [statusMenuAnchorEl, setStatusMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUseCaseForStatus, setSelectedUseCaseForStatus] = useState<UseCase | null>(null);
  const [deleteConfirmAnchorEl, setDeleteConfirmAnchorEl] = useState<null | HTMLElement>(null);
  const [useCaseToDelete, setUseCaseToDelete] = useState<string | null>(null);
  const deleteConfirmOpen = Boolean(deleteConfirmAnchorEl);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editFieldRef.current && !editFieldRef.current.contains(event.target as Node)) {
        if (editingField) {
          handleEditSubmit(useCases.find(uc => uc.id === editingField.id)!);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editingField, useCases]);

  const filteredUseCases = useCases.filter(useCase => 
    selectedStatuses.includes(useCase.status) &&
    (selectedTPMs.length === 0 || selectedTPMs.includes(useCase.techProductManager))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUseCase.name || !newUseCase.description) return;

    if (editingUseCase) {
      // Update existing use case
      setUseCases(useCases.map(uc => 
        uc.id === editingUseCase.id
          ? {
              ...uc,
              name: newUseCase.name || '',
              description: newUseCase.description || '',
              status: newUseCase.status as UseCase['status'],
              dataScienceDeveloper: newUseCase.dataScienceDeveloper || '',
              dataScienceManager: newUseCase.dataScienceManager || '',
              techProductManager: newUseCase.techProductManager || '',
              mle: newUseCase.mle || '',
              updatedAt: new Date(),
            }
          : uc
      ));
    } else {
      // Create new use case
      const useCase: UseCase = {
        id: Date.now().toString(),
        name: newUseCase.name,
        description: newUseCase.description,
        status: newUseCase.status as UseCase['status'],
        createdAt: new Date(),
        updatedAt: new Date(),
        dataScienceDeveloper: newUseCase.dataScienceDeveloper || '',
        dataScienceManager: newUseCase.dataScienceManager || '',
        techProductManager: newUseCase.techProductManager || '',
        mle: newUseCase.mle || '',
      };
      setUseCases([...useCases, useCase]);
      
      // Add new TPM to selected TPMs if it's not empty
      if (newUseCase.techProductManager) {
        setSelectedTPMs(prev => 
          prev.includes(newUseCase.techProductManager!) 
            ? prev 
            : [...prev, newUseCase.techProductManager!]
        );
      }
    }

    // Reset form
    setNewUseCase({
      name: '',
      description: '',
      status: 'Not Started',
      dataScienceDeveloper: '',
      dataScienceManager: '',
      techProductManager: '',
      mle: '',
    });
    setEditingUseCase(null);
    setShowEntryForm(false);
  };

  const handleDelete = (id: string) => {
    setUseCases(useCases.filter(useCase => useCase.id !== id));
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleAddStatus = () => {
    if (newStatus && !statusOptions.includes(newStatus)) {
      setStatusOptions([...statusOptions, newStatus]);
      setStatusColors({ ...statusColors, [newStatus]: newStatusColor });
      setSelectedStatuses(prev => [...prev, newStatus]);
      setNewStatus('');
      setNewStatusColor('#e0e0e0');
      setStatusDialogOpen(false);
    }
  };

  const handleEditStatus = (oldStatus: string) => {
    if (newStatus && oldStatus !== newStatus) {
      const newOptions = statusOptions.map(opt => opt === oldStatus ? newStatus : opt);
      const newColors = { ...statusColors };
      newColors[newStatus] = newColors[oldStatus];
      delete newColors[oldStatus];
      
      setStatusOptions(newOptions);
      setStatusColors(newColors);
      
      // Update existing use cases with the new status
      setUseCases(useCases.map(uc => 
        uc.status === oldStatus ? { ...uc, status: newStatus as UseCase['status'] } : uc
      ));
      
      setNewStatus('');
      setNewStatusColor('#e0e0e0');
      setEditingStatus(null);
      setStatusDialogOpen(false);
    }
  };

  const handleDeleteStatus = (status: string) => {
    if (statusOptions.length > 1) {
      const newOptions = statusOptions.filter(opt => opt !== status);
      const newColors = { ...statusColors };
      delete newColors[status];
      
      setStatusOptions(newOptions);
      setStatusColors(newColors);
      
      // Update use cases with the deleted status to "Not Started"
      setUseCases(useCases.map(uc => 
        uc.status === status ? { ...uc, status: 'Not Started' as UseCase['status'] } : uc
      ));
    }
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleEdit = (useCase: UseCase) => {
    // Only toggle edit mode, don't affect the expanded state
    setEditingUseCase(editingUseCase?.id === useCase.id ? null : useCase);
  };

  const startEditing = (useCase: UseCase, field: keyof UseCase) => {
    setEditingField({ id: useCase.id, field });
    setEditValue(useCase[field] as string);
  };

  const handleEditSubmit = (useCase: UseCase) => {
    if (!editingField || !editValue) return;

    setUseCases(useCases.map(uc => 
      uc.id === useCase.id
        ? {
            ...uc,
            [editingField.field]: editValue,
            updatedAt: new Date(),
          }
        : uc
    ));
    setEditingField(null);
    setEditValue('');
  };

  const handleKeyPress = (event: React.KeyboardEvent, useCase: UseCase) => {
    if (event.key === 'Enter') {
      handleEditSubmit(useCase);
    } else if (event.key === 'Escape') {
      setEditingField(null);
      setEditValue('');
    }
  };

  const handleStatusClick = (event: React.MouseEvent<HTMLElement>, useCase: UseCase) => {
    event.stopPropagation();
    setStatusMenuAnchorEl(event.currentTarget);
    setSelectedUseCaseForStatus(useCase);
  };

  const handleStatusSelect = (status: string) => {
    if (selectedUseCaseForStatus) {
      setUseCases(useCases.map(uc => 
        uc.id === selectedUseCaseForStatus.id
          ? { ...uc, status: status as UseCase['status'], updatedAt: new Date() }
          : uc
      ));
    }
    setStatusMenuAnchorEl(null);
    setSelectedUseCaseForStatus(null);
  };

  const handleStatusMenuClose = () => {
    setStatusMenuAnchorEl(null);
    setSelectedUseCaseForStatus(null);
  };

  const handleDeleteClick = (event: React.MouseEvent<HTMLElement>, id: string) => {
    event.stopPropagation();
    setDeleteConfirmAnchorEl(event.currentTarget);
    setUseCaseToDelete(id);
  };

  const handleDeleteConfirm = () => {
    if (useCaseToDelete) {
      handleDelete(useCaseToDelete);
      setDeleteConfirmAnchorEl(null);
      setUseCaseToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmAnchorEl(null);
    setUseCaseToDelete(null);
  };

  const handleManageClick = () => {
    setIsManageMode(true);
    setStatusDialogOpen(true);
    setNewStatus('');
    setNewStatusColor('#e0e0e0');
    setEditingStatus(null);
  };

  const handleAddStatusClick = () => {
    setStatusDialogOpen(true);
    setNewStatus('');
    setNewStatusColor('#e0e0e0');
    setEditingStatus(null);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, position: 'relative' }}>
          <Typography 
            variant="h4" 
            component="h1"
            sx={{
              flex: 1,
              textAlign: 'center',
              fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: '#1DB954',
              fontSize: '2.5rem',
              textTransform: 'uppercase',
              mb: 1
            }}
          >
            Pear
          </Typography>
          <Box sx={{ position: 'absolute', right: 0 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowEntryForm(true)}
              sx={{ 
                display: showEntryForm ? 'none' : 'flex',
                backgroundColor: '#1DB954',
                '&:hover': {
                  backgroundColor: '#1ed760'
                }
              }}
            >
              Add New Use Case
            </Button>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography 
                variant="h6"
                sx={{
                  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: '#000000',
                  textTransform: 'uppercase'
                }}
              >
                {showEntryForm ? 'Create A Use Case' : 'Use Cases'}
              </Typography>
              <Button
                startIcon={<FilterListIcon />}
                onClick={handleFilterClick}
                variant="outlined"
                size="small"
                sx={{ display: showEntryForm ? 'none' : 'flex' }}
              >
                Filter
              </Button>
            </Box>

            <Box sx={{ position: 'relative' }}>
              <Slide direction="up" in={showEntryForm} mountOnEnter unmountOnExit>
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 2,
                  }}
                >
                  <Paper 
                    sx={{ 
                      p: 3,
                      boxShadow: 3,
                    }}
                  >
                    <IconButton
                      size="small"
                      sx={{
                        position: 'absolute',
                        right: -8,
                        top: -8,
                        zIndex: 3,
                        color: 'text.secondary',
                        backgroundColor: 'background.paper',
                        boxShadow: 1,
                        '&:hover': {
                          color: 'text.secondary',
                          backgroundColor: '#e0e0e0',
                        },
                      }}
                      onClick={() => setShowEntryForm(false)}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                    <form onSubmit={handleSubmit}>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Use Case Name"
                            value={newUseCase.name}
                            onChange={(e) => setNewUseCase({ ...newUseCase, name: e.target.value })}
                            required
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Use Case Description"
                            multiline
                            rows={3}
                            value={newUseCase.description}
                            onChange={(e) => setNewUseCase({ ...newUseCase, description: e.target.value })}
                            required
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <FormControl fullWidth>
                            <InputLabel>Status</InputLabel>
                            <Select
                              value={newUseCase.status}
                              label="Status"
                              onOpen={() => setStatusSelectOpen(true)}
                              onClose={() => setStatusSelectOpen(false)}
                              onChange={(e) => {
                                if (e.target.value === 'add') {
                                  setStatusDialogOpen(true);
                                  setNewStatus('');
                                  setNewStatusColor('#e0e0e0');
                                  setEditingStatus(null);
                                } else {
                                  setNewUseCase({ ...newUseCase, status: e.target.value as UseCase['status'] });
                                }
                              }}
                            >
                              {statusOptions.map((status) => (
                                <MenuItem key={status} value={status}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', position: 'relative' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Box
                                        sx={{
                                          width: 16,
                                          height: 16,
                                          borderRadius: '50%',
                                          backgroundColor: statusColors[status],
                                          border: '1px solid rgba(0, 0, 0, 0.1)',
                                          flexShrink: 0,
                                        }}
                                      />
                                      <Typography>{status}</Typography>
                                    </Box>
                                    {statusSelectOpen && (
                                      <IconButton
                                        size="small"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteStatus(status);
                                        }}
                                        sx={{
                                          color: '#b71c1c',
                                          '&:hover': {
                                            backgroundColor: '#ffebee',
                                          },
                                          p: 0.5,
                                          minWidth: '24px',
                                          width: '24px',
                                          height: '24px'
                                        }}
                                      >
                                        <Typography sx={{ fontSize: '1.5rem', lineHeight: 1, fontWeight: 300, letterSpacing: '0.1em' }}>−</Typography>
                                      </IconButton>
                                    )}
                                  </Box>
                                </MenuItem>
                              ))}
                              <Divider />
                              <MenuItem value="add">
                                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <AddIcon fontSize="small" />
                                    <Typography>Add Status</Typography>
                                  </Box>
                                </Box>
                              </MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <TextField
                            fullWidth
                            label="Data Science Developer"
                            value={newUseCase.dataScienceDeveloper}
                            onChange={(e) => setNewUseCase({ ...newUseCase, dataScienceDeveloper: e.target.value })}
                          />
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <TextField
                            fullWidth
                            label="Data Science Manager"
                            value={newUseCase.dataScienceManager}
                            onChange={(e) => setNewUseCase({ ...newUseCase, dataScienceManager: e.target.value })}
                          />
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <TextField
                            fullWidth
                            label="Tech Product Manager"
                            value={newUseCase.techProductManager}
                            onChange={(e) => setNewUseCase({ ...newUseCase, techProductManager: e.target.value })}
                          />
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <TextField
                            fullWidth
                            label="Machine Learning Engineer"
                            value={newUseCase.mle}
                            onChange={(e) => setNewUseCase({ ...newUseCase, mle: e.target.value })}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            size="large"
                            sx={{
                              backgroundColor: '#1DB954',
                              '&:hover': {
                                backgroundColor: '#1ed760'
                              },
                              fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                              fontWeight: 700,
                              letterSpacing: '-0.02em',
                              textTransform: 'uppercase',
                              fontSize: '1.1rem'
                            }}
                          >
                            {editingUseCase ? 'Update Use Case' : 'Submit Use Case'}
                          </Button>
                        </Grid>
                      </Grid>
                    </form>
                  </Paper>
                </Box>
              </Slide>

              <Paper>
                <List sx={{ p: 2 }}>
                  {filteredUseCases.map((useCase) => (
                    <React.Fragment key={useCase.id}>
                      <ListItem
                        component="div"
                        onClick={() => toggleExpand(useCase.id)}
                        sx={{
                          cursor: 'pointer',
                          backgroundColor: statusColors[useCase.status],
                          borderRadius: '50px',
                          mb: 1,
                          '&:hover': {
                            backgroundColor: `${statusColors[useCase.status]}dd`,
                          },
                          '&:last-child': {
                            mb: 0,
                          }
                        }}
                      >
                        <ListItemText
                          primary={
                            editingField?.id === useCase.id && editingField.field === 'name' ? (
                              <TextField
                                fullWidth
                                size="small"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={(e) => handleKeyPress(e, useCase)}
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                                autoFocus
                                inputRef={editFieldRef}
                                InputProps={{
                                  endAdornment: (
                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                      <IconButton
                                        size="small"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEditSubmit(useCase);
                                        }}
                                        sx={{
                                          backgroundColor: '#e8f5e9',
                                          color: '#2e7d32',
                                          '&:hover': {
                                            backgroundColor: '#c8e6c9',
                                          },
                                          p: 0.5,
                                        }}
                                      >
                                        <CheckIcon fontSize="small" />
                                      </IconButton>
                                      <IconButton
                                        size="small"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setEditingField(null);
                                          setEditValue('');
                                        }}
                                        sx={{
                                          backgroundColor: '#ffebee',
                                          color: '#c62828',
                                          '&:hover': {
                                            backgroundColor: '#ffcdd2',
                                          },
                                          p: 0.5,
                                        }}
                                      >
                                        <CloseIcon fontSize="small" />
                                      </IconButton>
                                    </Box>
                                  ),
                                }}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    backgroundColor: 'white',
                                    borderRadius: 1,
                                    '& fieldset': {
                                      borderColor: 'primary.main'
                                    }
                                  }
                                }}
                              />
                            ) : (
                              <Box
                                onClick={(e) => {
                                  if (editingUseCase?.id === useCase.id) {
                                    e.stopPropagation();
                                    startEditing(useCase, 'name');
                                  }
                                }}
                                sx={{
                                  cursor: editingUseCase?.id === useCase.id ? 'text' : 'default',
                                  '&:hover': {
                                    textDecoration: editingUseCase?.id === useCase.id ? 'underline' : 'none',
                                  },
                                  pointerEvents: editingUseCase?.id === useCase.id ? 'auto' : 'none',
                                  pl: 2,
                                  fontWeight: 500,
                                  fontSize: '1.1rem',
                                }}
                              >
                                {useCase.name}
                              </Box>
                            )
                          }
                          secondary={
                            editingField?.id === useCase.id && editingField.field === 'description' ? (
                              <TextField
                                fullWidth
                                size="small"
                                multiline
                                rows={2}
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={(e) => handleKeyPress(e, useCase)}
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                                autoFocus
                                inputRef={editFieldRef}
                                InputProps={{
                                  endAdornment: (
                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                      <IconButton
                                        size="small"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEditSubmit(useCase);
                                        }}
                                        sx={{
                                          backgroundColor: '#e8f5e9',
                                          color: '#2e7d32',
                                          '&:hover': {
                                            backgroundColor: '#c8e6c9',
                                          },
                                          p: 0.5,
                                        }}
                                      >
                                        <CheckIcon fontSize="small" />
                                      </IconButton>
                                      <IconButton
                                        size="small"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setEditingField(null);
                                          setEditValue('');
                                        }}
                                        sx={{
                                          backgroundColor: '#ffebee',
                                          color: '#c62828',
                                          '&:hover': {
                                            backgroundColor: '#ffcdd2',
                                          },
                                          p: 0.5,
                                        }}
                                      >
                                        <CloseIcon fontSize="small" />
                                      </IconButton>
                                    </Box>
                                  ),
                                }}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    backgroundColor: 'white',
                                    borderRadius: 1,
                                    '& fieldset': {
                                      borderColor: 'primary.main'
                                    }
                                  }
                                }}
                              />
                            ) : (
                              <Box
                                onClick={(e) => {
                                  if (editingUseCase?.id === useCase.id) {
                                    e.stopPropagation();
                                    startEditing(useCase, 'description');
                                  }
                                }}
                                sx={{
                                  cursor: editingUseCase?.id === useCase.id ? 'text' : 'default',
                                  '&:hover': {
                                    textDecoration: editingUseCase?.id === useCase.id ? 'underline' : 'none',
                                  },
                                  pointerEvents: editingUseCase?.id === useCase.id ? 'auto' : 'none',
                                  pl: 2,
                                  color: 'text.secondary',
                                  fontSize: '0.95rem',
                                }}
                              >
                                {useCase.description}
                              </Box>
                            )
                          }
                          sx={{
                            '& .MuiListItemText-primary': {
                              whiteSpace: 'normal',
                              wordBreak: 'break-word',
                              m: 0,
                            },
                            '& .MuiListItemText-secondary': {
                              whiteSpace: 'normal',
                              wordBreak: 'break-word',
                              m: 0,
                            },
                            flex: 1,
                            minWidth: 0,
                            mr: 2,
                          }}
                        />
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1,
                            '& > *': {
                              position: 'relative',
                              zIndex: 1
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Chip
                            label={useCase.status}
                            onClick={(e) => handleStatusClick(e, useCase)}
                            sx={{ 
                              backgroundColor: 'rgba(255, 255, 255, 0.7)',
                              fontSize: '0.9rem',
                              height: '28px',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease-in-out',
                              '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                transform: 'scale(1.05)',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                              }
                            }}
                          />
                          <IconButton
                            edge="end"
                            aria-label="expand"
                            onClick={() => toggleExpand(useCase.id)}
                          >
                            {expandedId === useCase.id ? <ExpandMoreIcon /> : <ExpandLessIcon />}
                          </IconButton>
                          <IconButton
                            edge="end"
                            aria-label="edit"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(useCase);
                            }}
                            sx={{
                              color: editingUseCase?.id === useCase.id ? '#1DB954' : 'rgba(0, 0, 0, 0.54)'
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            edge="end"
                            aria-label="delete"
                            onClick={(e) => handleDeleteClick(e, useCase.id)}
                            sx={{
                              color: deleteConfirmOpen && useCaseToDelete === useCase.id ? '#b71c1c' : 'rgba(0, 0, 0, 0.54)',
                              '&:hover': {
                                color: '#b71c1c'
                              }
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </ListItem>
                      <Collapse in={expandedId === useCase.id} timeout="auto" unmountOnExit>
                        <Box sx={{ p: 3, bgcolor: 'background.default' }}>
                          <Grid container spacing={2}>
                            <Grid item xs={12}>
                              <Typography variant="subtitle1" gutterBottom>
                                Team Members
                              </Typography>
                              <Divider sx={{ mb: 2 }} />
                              <Grid container spacing={2}>
                                <Grid item xs={12} md={3}>
                                  <Typography variant="body2" color="textSecondary">
                                    Data Science Developer
                                  </Typography>
                                  {editingField?.id === useCase.id && editingField.field === 'dataScienceDeveloper' ? (
                                    <TextField
                                      fullWidth
                                      size="small"
                                      value={editValue}
                                      onChange={(e) => setEditValue(e.target.value)}
                                      onKeyDown={(e) => handleKeyPress(e, useCase)}
                                      autoFocus
                                      inputRef={editFieldRef}
                                      InputProps={{
                                        endAdornment: (
                                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                                            <IconButton
                                              size="small"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditSubmit(useCase);
                                              }}
                                              sx={{
                                                backgroundColor: '#e8f5e9',
                                                color: '#2e7d32',
                                                '&:hover': {
                                                  backgroundColor: '#c8e6c9',
                                                },
                                                p: 0.5,
                                              }}
                                            >
                                              <CheckIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                              size="small"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingField(null);
                                                setEditValue('');
                                              }}
                                              sx={{
                                                backgroundColor: '#ffebee',
                                                color: '#c62828',
                                                '&:hover': {
                                                  backgroundColor: '#ffcdd2',
                                                },
                                                p: 0.5,
                                              }}
                                            >
                                              <CloseIcon fontSize="small" />
                                            </IconButton>
                                          </Box>
                                        ),
                                      }}
                                      sx={{
                                        '& .MuiOutlinedInput-root': {
                                          backgroundColor: 'white',
                                          borderRadius: 1,
                                          '& fieldset': {
                                            borderColor: 'primary.main'
                                          }
                                        }
                                      }}
                                    />
                                  ) : (
                                    <Typography
                                      variant="body1"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (editingUseCase?.id === useCase.id) {
                                          startEditing(useCase, 'dataScienceDeveloper');
                                        }
                                      }}
                                      sx={{
                                        cursor: editingUseCase?.id === useCase.id ? 'text' : 'default',
                                        '&:hover': {
                                          textDecoration: editingUseCase?.id === useCase.id ? 'underline' : 'none',
                                        },
                                      }}
                                    >
                                      {useCase.dataScienceDeveloper || 'Not assigned'}
                                    </Typography>
                                  )}
                                </Grid>
                                <Grid item xs={12} md={3}>
                                  <Typography variant="body2" color="textSecondary">
                                    Data Science Manager
                                  </Typography>
                                  {editingField?.id === useCase.id && editingField.field === 'dataScienceManager' ? (
                                    <TextField
                                      fullWidth
                                      size="small"
                                      value={editValue}
                                      onChange={(e) => setEditValue(e.target.value)}
                                      onKeyDown={(e) => handleKeyPress(e, useCase)}
                                      autoFocus
                                      inputRef={editFieldRef}
                                      InputProps={{
                                        endAdornment: (
                                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                                            <IconButton
                                              size="small"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditSubmit(useCase);
                                              }}
                                              sx={{
                                                backgroundColor: '#e8f5e9',
                                                color: '#2e7d32',
                                                '&:hover': {
                                                  backgroundColor: '#c8e6c9',
                                                },
                                                p: 0.5,
                                              }}
                                            >
                                              <CheckIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                              size="small"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingField(null);
                                                setEditValue('');
                                              }}
                                              sx={{
                                                backgroundColor: '#ffebee',
                                                color: '#c62828',
                                                '&:hover': {
                                                  backgroundColor: '#ffcdd2',
                                                },
                                                p: 0.5,
                                              }}
                                            >
                                              <CloseIcon fontSize="small" />
                                            </IconButton>
                                          </Box>
                                        ),
                                      }}
                                      sx={{
                                        '& .MuiOutlinedInput-root': {
                                          backgroundColor: 'white',
                                          borderRadius: 1,
                                          '& fieldset': {
                                            borderColor: 'primary.main'
                                          }
                                        }
                                      }}
                                    />
                                  ) : (
                                    <Typography
                                      variant="body1"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (editingUseCase?.id === useCase.id) {
                                          startEditing(useCase, 'dataScienceManager');
                                        }
                                      }}
                                      sx={{
                                        cursor: editingUseCase?.id === useCase.id ? 'text' : 'default',
                                        '&:hover': {
                                          textDecoration: editingUseCase?.id === useCase.id ? 'underline' : 'none',
                                        },
                                      }}
                                    >
                                      {useCase.dataScienceManager || 'Not assigned'}
                                    </Typography>
                                  )}
                                </Grid>
                                <Grid item xs={12} md={3}>
                                  <Typography variant="body2" color="textSecondary">
                                    Tech Product Manager
                                  </Typography>
                                  {editingField?.id === useCase.id && editingField.field === 'techProductManager' ? (
                                    <TextField
                                      fullWidth
                                      size="small"
                                      value={editValue}
                                      onChange={(e) => setEditValue(e.target.value)}
                                      onKeyDown={(e) => handleKeyPress(e, useCase)}
                                      autoFocus
                                      inputRef={editFieldRef}
                                      InputProps={{
                                        endAdornment: (
                                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                                            <IconButton
                                              size="small"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditSubmit(useCase);
                                              }}
                                              sx={{
                                                backgroundColor: '#e8f5e9',
                                                color: '#2e7d32',
                                                '&:hover': {
                                                  backgroundColor: '#c8e6c9',
                                                },
                                                p: 0.5,
                                              }}
                                            >
                                              <CheckIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                              size="small"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingField(null);
                                                setEditValue('');
                                              }}
                                              sx={{
                                                backgroundColor: '#ffebee',
                                                color: '#c62828',
                                                '&:hover': {
                                                  backgroundColor: '#ffcdd2',
                                                },
                                                p: 0.5,
                                              }}
                                            >
                                              <CloseIcon fontSize="small" />
                                            </IconButton>
                                          </Box>
                                        ),
                                      }}
                                      sx={{
                                        '& .MuiOutlinedInput-root': {
                                          backgroundColor: 'white',
                                          borderRadius: 1,
                                          '& fieldset': {
                                            borderColor: 'primary.main'
                                          }
                                        }
                                      }}
                                    />
                                  ) : (
                                    <Typography
                                      variant="body1"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (editingUseCase?.id === useCase.id) {
                                          startEditing(useCase, 'techProductManager');
                                        }
                                      }}
                                      sx={{
                                        cursor: editingUseCase?.id === useCase.id ? 'text' : 'default',
                                        '&:hover': {
                                          textDecoration: editingUseCase?.id === useCase.id ? 'underline' : 'none',
                                        },
                                      }}
                                    >
                                      {useCase.techProductManager || 'Not assigned'}
                                    </Typography>
                                  )}
                                </Grid>
                                <Grid item xs={12} md={3}>
                                  <Typography variant="body2" color="textSecondary">
                                    Machine Learning Engineer
                                  </Typography>
                                  {editingField?.id === useCase.id && editingField.field === 'mle' ? (
                                    <TextField
                                      fullWidth
                                      size="small"
                                      value={editValue}
                                      onChange={(e) => setEditValue(e.target.value)}
                                      onKeyDown={(e) => handleKeyPress(e, useCase)}
                                      autoFocus
                                      inputRef={editFieldRef}
                                      InputProps={{
                                        endAdornment: (
                                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                                            <IconButton
                                              size="small"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditSubmit(useCase);
                                              }}
                                              sx={{
                                                backgroundColor: '#e8f5e9',
                                                color: '#2e7d32',
                                                '&:hover': {
                                                  backgroundColor: '#c8e6c9',
                                                },
                                                p: 0.5,
                                              }}
                                            >
                                              <CheckIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                              size="small"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingField(null);
                                                setEditValue('');
                                              }}
                                              sx={{
                                                backgroundColor: '#ffebee',
                                                color: '#c62828',
                                                '&:hover': {
                                                  backgroundColor: '#ffcdd2',
                                                },
                                                p: 0.5,
                                              }}
                                            >
                                              <CloseIcon fontSize="small" />
                                            </IconButton>
                                          </Box>
                                        ),
                                      }}
                                      sx={{
                                        '& .MuiOutlinedInput-root': {
                                          backgroundColor: 'white',
                                          borderRadius: 1,
                                          '& fieldset': {
                                            borderColor: 'primary.main'
                                          }
                                        }
                                      }}
                                    />
                                  ) : (
                                    <Typography
                                      variant="body1"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (editingUseCase?.id === useCase.id) {
                                          startEditing(useCase, 'mle');
                                        }
                                      }}
                                      sx={{
                                        cursor: editingUseCase?.id === useCase.id ? 'text' : 'default',
                                        '&:hover': {
                                          textDecoration: editingUseCase?.id === useCase.id ? 'underline' : 'none',
                                        },
                                      }}
                                    >
                                      {useCase.mle || 'Not assigned'}
                                    </Typography>
                                  )}
                                </Grid>
                              </Grid>
                            </Grid>
                          </Grid>
                        </Box>
                      </Collapse>
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
            </Box>
          </Box>

          <Menu
            anchorEl={filterAnchorEl}
            open={filterOpen}
            onClose={handleFilterClose}
            PaperProps={{
              sx: {
                width: 300,
                height: 300,
                borderRadius: 2,
                mt: 1,
                boxShadow: 3,
                '& .MuiMenu-list': {
                  padding: 0,
                }
              }
            }}
          >
            <Box sx={{ py: 0.25 }}>
              <MenuItem
                onClick={() => setShowStatusFilters(!showStatusFilters)}
                sx={{ 
                  py: 0.5,
                  px: 1,
                  borderRadius: 1,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 32 }}>
                  {showStatusFilters ? <ExpandMoreIcon /> : <ExpandLessIcon sx={{ transform: 'rotate(90deg)' }} />}
                </ListItemIcon>
                <ListItemText primary="Status" primaryTypographyProps={{ variant: 'body2' }} />
              </MenuItem>
              <Collapse in={showStatusFilters} timeout="auto" unmountOnExit>
                <Box sx={{ pl: 3 }}>
                  {statusOptions.map((status) => (
                    <MenuItem
                      key={status}
                      onClick={() => {
                        setSelectedStatuses(prev =>
                          prev.includes(status)
                            ? prev.filter(s => s !== status)
                            : [...prev, status]
                        );
                      }}
                      sx={{ 
                        py: 0.25, 
                        px: 1,
                        minHeight: '32px',
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, width: '100%' }}>
                        <Checkbox
                          checked={selectedStatuses.includes(status)}
                          size="small"
                          sx={{ p: 0.25 }}
                        />
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            backgroundColor: statusColors[status],
                            border: '1px solid rgba(0, 0, 0, 0.1)',
                            flexShrink: 0,
                          }}
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            textDecoration: selectedStatuses.includes(status) ? 'none' : 'line-through',
                            color: selectedStatuses.includes(status) ? 'text.primary' : 'text.secondary',
                            fontSize: '0.875rem'
                          }}
                        >
                          {status}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Box>
              </Collapse>

              <MenuItem
                onClick={() => setShowTPMFilters(!showTPMFilters)}
                sx={{ 
                  py: 0.5,
                  px: 1,
                  borderRadius: 1,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 32 }}>
                  {showTPMFilters ? <ExpandMoreIcon /> : <ExpandLessIcon sx={{ transform: 'rotate(90deg)' }} />}
                </ListItemIcon>
                <ListItemText primary="Tech Product Manager" primaryTypographyProps={{ variant: 'body2' }} />
              </MenuItem>
              <Collapse in={showTPMFilters} timeout="auto" unmountOnExit>
                <Box sx={{ pl: 3 }}>
                  {Array.from(new Set(useCases.map(uc => uc.techProductManager).filter(Boolean))).map((tpm) => (
                    <MenuItem
                      key={tpm}
                      onClick={() => {
                        setSelectedTPMs(prev =>
                          prev.includes(tpm)
                            ? prev.filter(s => s !== tpm)
                            : [...prev, tpm]
                        );
                      }}
                      sx={{ 
                        py: 0.25, 
                        px: 1,
                        minHeight: '32px',
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, width: '100%' }}>
                        <Checkbox
                          checked={selectedTPMs.includes(tpm)}
                          size="small"
                          sx={{ p: 0.25 }}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            textDecoration: selectedTPMs.includes(tpm) ? 'none' : 'line-through',
                            color: selectedTPMs.includes(tpm) ? 'text.primary' : 'text.secondary',
                            fontSize: '0.875rem'
                          }}
                        >
                          {tpm}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Box>
              </Collapse>
            </Box>
          </Menu>
        </Box>
      </Box>

      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)}>
        <DialogTitle>
          {editingStatus ? 'Edit Status' : 'Add New Status'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Status Name"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Status Color"
              type="color"
              value={newStatusColor}
              onChange={(e) => setNewStatusColor(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={editingStatus ? () => handleEditStatus(editingStatus) : handleAddStatus}
            variant="contained"
            disabled={!newStatus}
          >
            {editingStatus ? 'Save' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      <Menu
        anchorEl={statusMenuAnchorEl}
        open={Boolean(statusMenuAnchorEl)}
        onClose={handleStatusMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        PaperProps={{
          sx: {
            width: 160,
            borderRadius: 2,
            mt: 1,
            boxShadow: 3,
            backgroundColor: '#f5f5f5',
            '& .MuiMenu-list': {
              padding: 0.5,
              backgroundColor: '#f5f5f5'
            }
          }
        }}
      >
        {statusOptions.map((status) => (
          <MenuItem
            key={status}
            onClick={() => handleStatusSelect(status)}
            sx={{ 
              py: 0.5,
              px: 1,
              display: 'flex',
              justifyContent: 'center',
              '&:hover': {
                backgroundColor: 'transparent',
              }
            }}
          >
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                width: '100%',
                backgroundColor: statusColors[status],
                borderRadius: '50px',
                py: 0.25,
                px: 1.5,
                height: '24px',
                justifyContent: 'center',
                minWidth: '120px',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }
              }}
            >
              <Typography 
                variant="body2"
                sx={{
                  color: 'text.primary',
                  fontWeight: 500,
                  fontSize: '0.75rem',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  textAlign: 'center'
                }}
              >
                {status}
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Menu>

      <Menu
        anchorEl={deleteConfirmAnchorEl}
        open={deleteConfirmOpen}
        onClose={handleDeleteCancel}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        PaperProps={{
          sx: {
            width: 140,
            borderRadius: 2,
            mt: 1,
            boxShadow: 3,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -8,
              left: '50%',
              transform: 'translateX(-50%) rotate(45deg)',
              width: 16,
              height: 16,
              backgroundColor: 'background.paper',
              boxShadow: '-2px -2px 5px rgba(0,0,0,0.06)',
            }
          }
        }}
      >
        <Box sx={{ p: 1.25 }}>
          <Box sx={{ mb: 1, textAlign: 'center' }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700,
                mb: 0.25,
                fontFamily: '"Montserrat", sans-serif',
                fontSize: '1.1rem',
                letterSpacing: '0.02em',
                color: '#d32f2f',
                lineHeight: 1.2
              }}
            >
              Last Chance
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 'bold', 
                fontSize: '0.8rem',
                color: 'text.secondary',
                lineHeight: 1.2
              }}
            >
              Are you sure?
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
            <Button
              size="small"
              variant="outlined"
              onClick={handleDeleteCancel}
              sx={{ 
                minWidth: 45, 
                fontSize: '0.8rem',
                py: 0.25,
                px: 1
              }}
            >
              No
            </Button>
            <Button
              size="small"
              variant="contained"
              color="error"
              onClick={handleDeleteConfirm}
              sx={{ 
                minWidth: 45, 
                fontSize: '0.8rem',
                py: 0.25,
                px: 1
              }}
            >
              Yes
            </Button>
          </Box>
        </Box>
      </Menu>
    </Container>
  );
}

export default App;
