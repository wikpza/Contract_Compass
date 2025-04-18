
import React, { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { DataTable } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/utils/helpers';
import { v4 as uuidv4 } from 'uuid';
import { Link as RouterLink } from 'react-router-dom';
import { ExternalLink, Copy } from 'lucide-react';

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

import LinkForm from '@/components/LinkForm';
import { projects } from '@/data/mockData';

// Mock links data
const mockLinks: Link[] = [
  {
    id: '1',
    projectId: '1',
    status: 'active',
    url: 'https://contractcompass.example/guest/projects/1',
    createdAt: new Date('2023-04-15'),
  },
  {
    id: '2',
    projectId: '2',
    status: 'inactive',
    url: 'https://contractcompass.example/guest/projects/2',
    createdAt: new Date('2023-05-20'),
  }
];

const Links = () => {
  const { toast } = useToast();
  const [links, setLinks] = useState<Link[]>(mockLinks);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<Link | null>(null);

  // CRUD Operations
  const handleAddLink = (linkData: Omit<Link, 'id' | 'url' | 'createdAt'>) => {
    const newLink: Link = {
      id: uuidv4(),
      projectId: linkData.projectId,
      status: linkData.status,
      // Use a real URL format that would work with the app
      url: `${window.location.origin}/guest/projects/${linkData.projectId}`,
      createdAt: new Date(),
    };
    
    setLinks([...links, newLink]);
    setIsAddDialogOpen(false);
    toast({
      title: "Link created",
      description: "The link has been created successfully.",
    });
  };

  const handleEditLink = (link: Link) => {
    setLinks(links.map(l => l.id === link.id ? link : l));
    setIsEditDialogOpen(false);
    setSelectedLink(null);
    toast({
      title: "Link updated",
      description: "The link has been updated successfully.",
    });
  };

  const handleDeleteLink = () => {
    if (selectedLink) {
      setLinks(links.filter(l => l.id !== selectedLink.id));
      setIsDeleteDialogOpen(false);
      toast({
        title: "Link deleted",
        description: "The link has been deleted.",
        variant: "destructive",
      });
      setSelectedLink(null);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "Copied to clipboard",
      description: "Link URL has been copied to clipboard",
    });
  };

  // Dialog handlers
  const openEditDialog = (link: Link) => {
    setSelectedLink(link);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (link: Link) => {
    setSelectedLink(link);
    setIsDeleteDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const columns = [
    {
      header: 'Project',
      accessor: 'projectId',
      render: (projectId: string) => {
        const project = projects.find(p => p.id === projectId);
        return project?.name || 'Unknown Project';
      },
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (status: string) => (
        <Badge className={getStatusColor(status)} variant="outline">
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      ),
    },
    {
      header: 'Created Date',
      accessor: 'createdAt',
      render: (date: Date) => formatDate(date),
    },
    {
      header: 'Actions',
      accessor: 'id',
      render: (_: any, row: Link) => (
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => copyToClipboard(row.url)}
          >
            <Copy className="h-4 w-4 mr-1" />
            Copy Link
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            asChild
          >
            <RouterLink to={`/guest/projects/${row.projectId}`} target="_blank">
              <ExternalLink className="h-4 w-4 mr-1" />
              Open
            </RouterLink>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader 
        title="Shareable Links" 
        description="Create and manage guest access links for projects"
        action={{
          label: 'Create Link',
          onAction: () => setIsAddDialogOpen(true),
        }}
      />
      
      <div className="rounded-md border bg-white">
        <DataTable 
          columns={columns} 
          data={links} 
          onEdit={openEditDialog}
          onDelete={openDeleteDialog}
          hideActions={false}
        />
      </div>

      {/* Add Link Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Link</DialogTitle>
          </DialogHeader>
          <LinkForm 
            projects={projects}
            onSubmit={handleAddLink}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Link Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Link</DialogTitle>
          </DialogHeader>
          {selectedLink && (
            <LinkForm 
              link={selectedLink}
              projects={projects}
              onSubmit={handleEditLink}
              onCancel={() => setIsEditDialogOpen(false)}
              editMode={true}
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
              This will permanently delete the guest access link.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteLink}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Links;
