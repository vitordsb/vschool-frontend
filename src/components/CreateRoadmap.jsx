import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import api from '../lib/api.jsx';

const CreateRoadmap = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [roadmap, setRoadmap] = useState({
    title: '',
    description: '',
    is_public: false
  });
  const [modules, setModules] = useState([
    { title: '', description: '', order: 1 }
  ]);

  const handleRoadmapChange = (field, value) => {
    setRoadmap(prev => ({ ...prev, [field]: value }));
  };

  const handleModuleChange = (index, field, value) => {
    const updatedModules = [...modules];
    updatedModules[index][field] = value;
    setModules(updatedModules);
  };

  const addModule = () => {
    setModules(prev => [...prev, { 
      title: '', 
      description: '', 
      order: prev.length + 1 
    }]);
  };

  const removeModule = (index) => {
    if (modules.length > 1) {
      const updatedModules = modules.filter((_, i) => i !== index);
      // Reordenar os módulos
      updatedModules.forEach((module, i) => {
        module.order = i + 1;
      });
      setModules(updatedModules);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Criar roadmap
      const roadmapResponse = await api.post('/roadmaps', roadmap);
      const createdRoadmap = roadmapResponse.data;

      // Criar módulos
      for (const module of modules) {
        if (module.title.trim()) {
          await api.post('/modules', {
            ...module,
            roadmap_id: createdRoadmap._id
          });
        }
      }

      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'Erro ao criar roadmap');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Criar Novo Roadmap</h1>
          <p className="text-gray-600">Defina o roadmap e seus módulos de estudo</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Informações do Roadmap */}
          <Card>
            <CardHeader>
              <CardTitle>Informações do Roadmap</CardTitle>
              <CardDescription>
                Defina as informações básicas do roadmap
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Título</label>
                <Input
                  value={roadmap.title}
                  onChange={(e) => handleRoadmapChange('title', e.target.value)}
                  placeholder="Ex: Fundamentos de Python"
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Descrição</label>
                <Textarea
                  value={roadmap.description}
                  onChange={(e) => handleRoadmapChange('description', e.target.value)}
                  placeholder="Descreva o objetivo e conteúdo do roadmap"
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_public"
                  checked={roadmap.is_public}
                  onChange={(e) => handleRoadmapChange('is_public', e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="is_public" className="text-sm font-medium">
                  Tornar público (gera URL compartilhável)
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Módulos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Módulos do Roadmap
                <Button type="button" onClick={addModule} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Módulo
                </Button>
              </CardTitle>
              <CardDescription>
                Defina os módulos que compõem este roadmap
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {modules.map((module, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Módulo {index + 1}</h4>
                    {modules.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeModule(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Título do Módulo</label>
                    <Input
                      value={module.title}
                      onChange={(e) => handleModuleChange(index, 'title', e.target.value)}
                      placeholder="Ex: Variáveis e Tipos de Dados"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Descrição</label>
                    <Textarea
                      value={module.description}
                      onChange={(e) => handleModuleChange(index, 'description', e.target.value)}
                      placeholder="Descreva o conteúdo deste módulo"
                      required
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <div className="flex justify-end space-x-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Criando...' : 'Criar Roadmap'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoadmap;

