import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { ArrowLeft, CheckCircle, Circle, Share2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';
import api from '../lib/api.jsx';

const RoadmapView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [roadmap, setRoadmap] = useState(null);
  const [modules, setModules] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoadmapData();
  }, [id]);

  const fetchRoadmapData = async () => {
    try {
      // Buscar roadmap
      const roadmapResponse = await api.get(`/roadmaps/${id}`);
      setRoadmap(roadmapResponse.data);

      // Buscar módulos
      const modulesResponse = await api.get(`/modules/roadmap/${id}`);
      setModules(modulesResponse.data);

      // Buscar progresso
      const progressResponse = await api.get(`/progress/roadmap/${id}`);
      const progressMap = {};
      progressResponse.data.forEach(p => {
        progressMap[p.module_id] = p.completed;
      });
      setProgress(progressMap);

    } catch (error) {
      console.error('Erro ao buscar dados do roadmap:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleModuleProgress = async (moduleId) => {
    try {
      const currentStatus = progress[moduleId] || false;
      const newStatus = !currentStatus;

      await api.post('/progress', {
        module_id: moduleId,
        completed: newStatus
      });

      setProgress(prev => ({
        ...prev,
        [moduleId]: newStatus
      }));
    } catch (error) {
      console.error('Erro ao atualizar progresso:', error);
    }
  };

  const calculateProgress = () => {
    if (modules.length === 0) return 0;
    const completedCount = Object.values(progress).filter(Boolean).length;
    return Math.round((completedCount / modules.length) * 100);
  };

  const shareRoadmap = () => {
    if (roadmap?.shared_url) {
      const shareUrl = `${window.location.origin}/shared/${roadmap.shared_url}`;
      navigator.clipboard.writeText(shareUrl);
      alert('URL copiada para a área de transferência!');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Roadmap não encontrado
            </h3>
            <Button onClick={() => navigate('/dashboard')}>
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progressPercentage = calculateProgress();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
                            <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {roadmap.title}
                </h1>
                <p className="text-gray-600">{roadmap.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              {roadmap.is_public && (
                <Button variant="outline" onClick={shareRoadmap}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartilhar
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Progress value={progressPercentage} className="w-full" />
          <div className="flex justify-between text-sm text-gray-500 mt-2">
            <span>{Object.values(progress).filter(Boolean).length} de {modules.length} módulos concluídos</span>
            {progressPercentage === 100 ? (
              <span className="font-semibold text-green-500">Parabéns, voce concluiu o roadmap!</span>            
            ) : (
                <span className="font-semibold text-red-500">{progressPercentage}% completo</span>
            ) }  
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {modules.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum módulo encontrado
                </h3>
                <p className="text-gray-500">
                  Este roadmap ainda não possui módulos
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules.map((module) => {
                const isCompleted = progress[module._id] || false;
                
                return (
                  <Card 
                    key={module._id} 
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      isCompleted ? 'bg-green-50 border-green-200' : 'hover:border-primary'
                    }`}
                    onClick={() => toggleModuleProgress(module._id)}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center">
                          {isCompleted ? (
                            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-400 mr-2" />
                          )}
                          Módulo {module.order}
                        </span>
                        {isCompleted && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            Concluído
                          </span>
                        )}
                      </CardTitle>
                      <CardDescription className="font-medium text-gray-900">
                        {module.title}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm">
                        {module.description}
                      </p>
                      {module.content && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs text-gray-500">
                            Clique para {isCompleted ? 'desmarcar' : 'marcar'} como concluído
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default RoadmapView;

