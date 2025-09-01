import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Plus, BookOpen, Users, LogOut } from 'lucide-react';
import api from '../lib/api.jsx';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllRoadmaps, setShowAllRoadmaps] = useState([]);

  useEffect(() => {
    fetchRoadmaps();
    if (isAdmin) {
      fetchAllRoadmaps();
    }
  }, []);

  const handleDelete = async (roadmapId) => {
    try {
      await api.delete(`/roadmaps/${roadmapId}`);
      fetchRoadmaps();
      if (isAdmin) {
        fetchAllRoadmaps();
      }
    } catch (error) {
      console.error('Erro ao excluir roadmap:', error);
    }
  }
  const fetchRoadmaps = async () => {
    try {
      const response = await api.get('/roadmaps');
      setRoadmaps(response.data);
      console.log(response.data);
    } catch (error) {
      console.error('Erro ao buscar roadmaps:', error);
    } finally {
      setLoading(false);
    }
  };
  const fetchAllRoadmaps = async () => {
    try {
      const response = await api.get('/roadmaps/getall');
      setShowAllRoadmaps(response.data);
      // verificar se o roadmap é publico 
      console.log(response.data);
    } catch (error) {
      console.error('Erro ao buscar todos os roadmaps:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                VconStudy - Dashboard
              </h1>
              <p className="text-gray-600">
                Bem-vindo, {user?.username} ({user?.role === 'admin' ? 'Administrador' : 'Estudante'})
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {isAdmin && (
                <Button variant="outline" onClick={() => navigate('/users')}>
                  <Users className="w-4 h-4 mr-2" />
                  Gerenciar Usuários
                </Button>
              )}
              <Button onClick={handleLogout} variant="outline">
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Actions */}

          {isAdmin && (
            <div className="mb-4">
              <Button onClick={() => navigate('/create-roadmap')}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Roadmap
              </Button>
            </div>
          )}

          {!isAdmin && roadmaps.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum roadmap encontrado
                </h3>
                <p className="text-gray-500 text-center mb-4">
                  Comece criando seu primeiro roadmap de estudos
                </p>
                <Button onClick={() => navigate('/create-roadmap')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Roadmap
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roadmaps.map((roadmap) => (
                <Card key={roadmap._id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{roadmap.title}</span>
                      {roadmap.is_public && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Público
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {roadmap.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        Criado em {new Date(roadmap.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                      <Button size="sm" onClick={() => navigate(`/roadmap/${roadmap._id}`)}>
                        Ver Roadmap
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {isAdmin && showAllRoadmaps.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum roadmap encontrado
                </h3>
                <p className="text-gray-500 text-center mb-4">
                  Comece criando seu primeiro roadmap de estudos
                </p>
                <Button onClick={() => navigate('/create-roadmap')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Roadmap
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {showAllRoadmaps.map((showAllRoadmaps) => (
                <Card key={showAllRoadmaps._id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <span>Aluno: {showAllRoadmaps.owner_id.username}</span>
                    <CardTitle className="flex items-center justify-between">
                      <span>{showAllRoadmaps.title}</span>
                      {showAllRoadmaps.is_public && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Público
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {showAllRoadmaps.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        Criado em {new Date(showAllRoadmaps.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                      {showAllRoadmaps.is_public && (
                        <Button size="sm" onClick={() => navigate(`/roadmap/${showAllRoadmaps._id}`)}>
                          Ver Roadmap
                        </Button>
                      )}
                      <Button onClick={() => handleDelete(showAllRoadmaps._id)} variant="destructive" size="sm">
                        Excluir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default Dashboard;

