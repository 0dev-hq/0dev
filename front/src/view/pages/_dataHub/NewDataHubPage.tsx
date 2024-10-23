import React, { useEffect } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DataHub } from '@/models/DataHub';
import { addDataHub, getDataHubById, updateDataHub } from '@/services/dataHubService';
import { Save } from 'lucide-react';

// Define the form schema using Zod
const FormSchema = z.object({
  name: z.string().nonempty({ message: "Name is required" }),
  language: z.string().nonempty({ message: "Please select a language" }),
  description: z.string().optional(),
});

const NewDataHubPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: '',
      language: '',
      description: '',
    },
  });

  const { reset, control, handleSubmit, formState: { errors } } = form;
  
  const goToBase = () => navigate('/data-hub/dashboard');

  const languages = ['English', 'Spanish', 'French', 'German', 'Chinese'];

  // Query for fetching data hub by ID (if editing an existing one)
  const { isLoading: isFetchingData } = useQuery(
    ['dataHub', id],
    () => getDataHubById(id!),
    {
      enabled: !!id,
      onSuccess: (data) => reset(data),
    }
  );

  const { mutate: add, isLoading: isAdding } = useMutation(addDataHub, {
    onSuccess: () => {
      queryClient.invalidateQueries('dataHubs');
      goToBase();
    },
  });

  const { mutate: update, isLoading: isUpdating } = useMutation(updateDataHub, {
    onSuccess: () => {
      queryClient.invalidateQueries('dataHubs');
      goToBase();
    },
  });

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    if (id) {
      update({ ...data, id });
    } else {
      add(data);
    }
  };

  return (
    <div className="flex justify-center py-10">
      <Card className="w-full max-w-lg p-6 space-y-6 text-black">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">
            {id ? 'Edit Data Hub' : 'Add New Data Hub'}
          </CardTitle>
        </CardHeader>

        {isFetchingData && <p>Loading data...</p>}

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hub Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter the hub name" {...field} />
                    </FormControl>
                    <FormMessage>{errors.name?.message}</FormMessage>
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a language" />
                        </SelectTrigger>
                        <SelectContent>
                          {languages.map((lang) => (
                            <SelectItem key={lang} value={lang}>
                              {lang}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage>{errors.language?.message}</FormMessage>
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter a brief description" {...field} />
                    </FormControl>
                    <FormMessage>{errors.description?.message}</FormMessage>
                  </FormItem>
                )}
              />
            </CardContent>

            <CardFooter className="flex justify-between space-x-4">
              <Button onClick={goToBase} variant="outline" className="bg-gray-300">
                Cancel
              </Button>
              <Button type="submit" variant="default" className="bg-black text-white">
                <Save className="h-4 w-4 mr-2" />
                {isAdding || isUpdating ? 'Saving...' : 'Save Data Hub'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default NewDataHubPage;
