import React, {useEffect, useState} from 'react';
import axios from "axios";
import type {CommercialCategory, CommercialCategoryFee} from "../../../Types/api.tsx";
import CategoryFeeForm from "../CategoryFeeForm";

interface CategoryFeesManagerProps {
  category: CommercialCategory;
}

const CategoryFeesManager = ({category}: CategoryFeesManagerProps) => {
  const [selectedCategory, setSelectedCategory] = useState<CommercialCategory>();
  const [categoryFees, setCategoryFees] = useState<CommercialCategoryFee[]>();
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {
        category_uuid: category.uuid,
      }
    };

    setLoading(true);

    axios
      .get(`commercial/seller-category-fees`, config)
      .then(response => {
        if (response) {
          setCategoryFees(response.data);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    return cancelTokenSource.cancel;
  }, [reload]);

  const deleteCategory = (uuid: string) => {
    axios.delete(`commercial/seller-category/${uuid}`, {})
      .then(response => {
        setReload(!reload);
        setSelectedCategory(undefined);
      })
      .catch();
  }

  return (
    <div>
      {categoryFees?.map((cFee, index) => (
        <div style={{marginBottom: 10}} key={index}>
          <CategoryFeeForm category={category} categoryFee={cFee} onComplete={() => setReload(!reload)}/>
        </div>
      ))}
      <CategoryFeeForm category={category} onComplete={() => setReload(!reload)}/>
    </div>
  );
};

export default CategoryFeesManager;
