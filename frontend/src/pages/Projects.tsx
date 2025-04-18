
import React, { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { DataTable } from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { projects as mockProjects } from '@/data/mockData';
import { formatDate } from '@/utils/helpers';
import { Project } from '@/types';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import ProjectForm from '@/components/ProjectForm';

const Projects = () => {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // CRUD Operations
  const handleAddProject = (project: Project) => {
    setProjects([...projects, project]);
    setIsAddDialogOpen(false);
    toast({
      title: "Project added",
      description: `${project.name} has been added successfully.`,
    });
  };

  const handleEditProject = (project: Project) => {
    setProjects(projects.map(p => p.id === project.id ? project : p));
    setIsEditDialogOpen(false);
    setSelectedProject(null);
    toast({
      title: "Project updated",
      description: `${project.name} has been updated successfully.`,
    });
  };

  const handleDeleteProject = () => {
    if (selectedProject) {
      setProjects(projects.filter(p => p.id !== selectedProject.id));
      setIsDeleteDialogOpen(false);
      toast({
        title: "Project deleted",
        description: `${selectedProject.name} has been deleted.`,
        variant: "destructive",
      });
      setSelectedProject(null);
    }
  };

  // Dialog handlers
  const openEditDialog = (project: Project) => {
    setSelectedProject(project);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (project: Project) => {
    setSelectedProject(project);
    setIsDeleteDialogOpen(true);
  };

  const columns = [
    {
      header: 'Name',
      accessor: 'name',
    },
    {
      header: 'Description',
      accessor: 'description',
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (status: string) => {
        let color = '';
        switch(status) {
          case 'active':
            color = 'bg-green-100 text-green-800';
            break;
          case 'completed':
            color = 'bg-blue-100 text-blue-800';
            break;
          case 'on-hold':
            color = 'bg-yellow-100 text-yellow-800';
            break;
          default:
            color = 'bg-gray-100 text-gray-800';
        }
        return (
          <Badge className={color} variant="outline">
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      },
    },
    {
      header: 'Start Date',
      accessor: 'startDate',
      render: (date: Date) => formatDate(date),
    },
    {
      header: 'End Date',
      accessor: 'endDate',
      render: (date: Date) => formatDate(date),
    },
  ];

  return (
    <>
      <PageHeader 
        title="Projects" 
        description="Manage your projects"
        action={{
          label: 'Add Project',
          onAction: () => setIsAddDialogOpen(true),
        }}
      />
      <div className="rounded-md border bg-white">
        <DataTable 
          columns={columns} 
          data={projects} 
          viewPath="/projects"
          onEdit={openEditDialog}
          onDelete={openDeleteDialog}
        />
      </div>

      {/* Add Project Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Project</DialogTitle>
          </DialogHeader>
          <ProjectForm 
            onSubmit={handleAddProject}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          {selectedProject && (
            <ProjectForm 
              project={selectedProject}
              onSubmit={handleEditProject}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the project
              {selectedProject && <strong> "{selectedProject.name}"</strong>}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProject}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Projects;
