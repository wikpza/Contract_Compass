
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { v4 as uuidv4 } from 'uuid';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link, Project } from '@/types';

const formSchema = z.object({
  projectId: z.string().min(1, { message: 'Project is required' }),
  status: z.enum(['active', 'inactive', 'expired'], { 
    required_error: 'Status is required' 
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface LinkFormProps {
  link?: Link;
  projects: Project[];
  onSubmit: (link: Link) => void;
  onCancel: () => void;
  editMode?: boolean; // Add editMode as an optional prop
}

const LinkForm = ({ link, projects, onSubmit, onCancel, editMode = false }: LinkFormProps) => {
  const isEditing = !!link || editMode;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectId: link?.projectId || '',
      status: link?.status || 'active',
    },
  });

  const handleSubmit = (values: FormValues) => {
    const project = projects.find(p => p.id === values.projectId);
    
    if (!project) return;
    
    const newLink: Link = {
      id: link?.id || uuidv4(),
      projectId: values.projectId,
      status: values.status,
      url: link?.url || `https://contract-compass.com/links/${uuidv4().slice(0, 8)}`,
      createdAt: link?.createdAt || new Date(),
    };
    
    onSubmit(newLink);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="projectId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project</FormLabel>
              <FormControl>
                <Select
                  disabled={isEditing}
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onCancel} type="button">Cancel</Button>
          <Button type="submit">{isEditing ? 'Update Link' : 'Create Link'}</Button>
        </div>
      </form>
    </Form>
  );
};

export default LinkForm;
