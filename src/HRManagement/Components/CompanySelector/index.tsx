import {useEffect, useState} from 'react';
import {Modal, Select} from 'antd';
import {PiPlusBold} from 'react-icons/pi';
import {useDebounce} from "@uidotdev/usehooks";
import axios from "axios";

import type {Company, Profile} from "../../../Types/api.tsx";
import PrimaryButton from "../../../CommonUI/PrimaryButton";
import CompanyForm from "../CompanyForm";
import ErrorHandler from "../../../Utils/ErrorHandler.tsx";


interface CompanySelectorProps {
  placeholder?: string;
  exclude?: string;
  filter?: string;
  onChange?: (value: any, option: any) => void;
  bordered?: boolean;
  value?: string | string[];
  disabled?: boolean;
  allowCreate?: boolean;
  style?: any;
  size?: 'small' | 'large';
  mode?: 'multiple' | 'tags' | undefined;
}

const CompanySelector = (
  {
    onChange,
    placeholder,
    mode,
    filter,
    allowCreate = true,
    ...props
  }: CompanySelectorProps) => {
  const [openCreateCompany, setOpenCreateCompany] = useState(false);
  const [createdCompany, setCreatedCompany] = useState<Company>();
  const [loading, setLoading] = useState(false);
  const [searchCompany, setSearchCompany] = useState<string>();
  const lastSearchText = useDebounce(searchCompany, 400);
  const [companies, setCompanies] = useState<Company[]>()

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {search: lastSearchText, page: 1, filter},
    };

    setLoading(true);
    axios
      .get('hr-management/companies', config)
      .then(response => {
        setLoading(false);
        if (response) {
          setCompanies(
            response.data.data.map((item: Profile) => {
              return {value: item.uuid, label: item.name, entity: item};
            }),
          );
        }
      })
      .catch(error => {
        setLoading(false);
        ErrorHandler.showNotification(error);
      });

    return cancelTokenSource.cancel;
  }, [lastSearchText]);

  return (
    <>
      <div style={{display: 'flex'}}>
        <Select
          {...props}
          allowClear
          placeholder={placeholder || 'Elige una empresa'}
          showSearch={true}
          filterOption={false}
          loading={loading}
          options={companies}
          popupMatchSelectWidth={false}
          onChange={onChange}
          mode={mode || undefined}
          onSearch={value => setSearchCompany(value)}
          optionRender={(option: any) => {
            return (
              <div>
                {option?.label}
                <br/>
                <small>
                  RUC: {option.data.entity.legal_uid}
                </small>
              </div>
            );
          }}
        />
        {allowCreate && (
          <PrimaryButton
            onClick={() => setOpenCreateCompany(true)}
            icon={<PiPlusBold size={14}/>}
            style={{marginLeft: 8}}
            label={'Nuevo'}
          />
        )}
      </div>
      <Modal
        title={'Registrar nueva empresa'}
        footer={false}
        open={openCreateCompany}
        onCancel={() => setOpenCreateCompany(false)}>
        <CompanyForm
          onComplete={(company: Company) => {
            setCreatedCompany(company);
            setOpenCreateCompany(false);
            if (onChange) {
              onChange(company.uuid, company);
            }
          }}
        />
      </Modal>
    </>
  );
};

export default CompanySelector;
