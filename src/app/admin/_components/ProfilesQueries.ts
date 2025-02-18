import { useQueries } from "@tanstack/react-query";
import { toast } from "sonner";
import { GetAllProfilesDTO } from "@/app/api/profiles/route";

const fetchUsers = async (): Promise<GetAllProfilesDTO[]> => {
  const response = await fetch(`/api/profiles`);
  if (!response.ok) {
    throw new Error(`Failed to fetch users`);
  }
  return response.json();
};

export const useProfileOptions = () => {
  const results = useQueries({
    queries: [{ queryKey: ["profiles"], queryFn: fetchUsers }],
  });

  const isError = results.some((result) => result.isError);
  const isLoading = results.some((result) => result.isLoading);

  if (isError && !isLoading) {
    toast("Não foi possível carregar os dados para a criação do dialog");
  }
  const categories = Array.from(
    new Set(
      results[0].data?.flatMap(
        (categorie: GetAllProfilesDTO) => categorie.category.categories
      )
    )
  );

  const types = ["hospedagem", "restaurante", "parque", "lugares", "quadros"]; //estou simulando o banco

  return {
    categories,
    types,

    isLoading,
    isError,
  };
};
