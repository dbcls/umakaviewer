export namespace Url {
  export const TOP = '/'
  export const SIGN_UP = '/signup'
  export const LOGIN = '/login'
  export const VISUALIZER_PREFIX = '/v'
  export const SETTING = '/setting'
  export const UPDATE_USER = '/update_user'
  export const DELETE_USER = '/delete_user'
  export const DATA_SET_SETTING = '/data_set_setting'
  export const PUBLIC_DATA_SETS = '/public_data_sets'
  export namespace Admin {
    export const PREFIX = '/admin'
    export const DATA_SETS = '/data_sets'
  }
  export namespace Api {
    export const CREATE_USER = '/signup'
    export const AUTH = '/auth'
    export const DATA_SET_LIST = '/data_sets'
    export const DATA_SET_GENERATE = `${DATA_SET_LIST}/generate`
    export const resultOfDataSetGenerate = (taskId: string) =>
      `${DATA_SET_GENERATE}/${taskId}`
    export const visualize = (path: string) => `/visualize/${path}`
    export const ME = '/me'
    export const MY_CUSTOM_TOKEN = `${ME}/custom_token`
    export const PUBLIC_DATA_SET_LIST = '/public_data_sets'
    export namespace Admini {
      const PREFIX = '/admin'
      export const ADMIN_DATA_SET_LIST = `${PREFIX}/data_sets`
    }
    export const HEALTHY = '/healthy'
  }
  export namespace External {
    export const UMAKAPARSER_GITHUB = 'https://github.com/dbcls/umakaviewer'
    export const DOC_SBM = 'http://www.sparqlbuilder.org/doc/sbm_2015sep/'
  }
}

export namespace FormAttributes {
  export namespace SignUp {
    export const NAME = 'SignUp'
  }
  export namespace Login {
    export const NAME = 'Login'
  }
  export namespace UserDelete {
    export const NAME = 'UserDelete'
  }
  export namespace DataSetSetting {
    export const NAME = 'DataSetSetting'
    export namespace Tag {
      export const MAX_COUNT = 5
      export const NAME_MAX_LENGTH = 20
      export const NAME_MIN_LENGTH = 1
    }
  }
  export namespace UserUpdate {
    export const NAME = 'UserUpdate'
    export const DISPLAY_NAME_MAX_LENGTH = 30
    export const CONTACT_URI_MAX_LENGTH = 255
  }
  export namespace PublicDataSetSearch {
    export const NAME = 'PublicDataSetSearch'
    export enum SortValue {
      CLASSES_DESC = 1,
      CLASSES_ASC = 2,
      PROPERTIES_DESC = 3,
      PROPERTIES_ASC = 4,
      UPLOAD_AT_DESC = 5,
      UPLOAD_AT_ASC = 6,
    }
    export const SORT_TYPES = [
      { value: SortValue.CLASSES_DESC, id: 'sortBy.descendingNumberOfClass' },
      { value: SortValue.CLASSES_ASC, id: 'sortBy.ascendingNumberOfClass' },
      {
        value: SortValue.PROPERTIES_DESC,
        id: 'sortBy.descendingNumberOfProperty',
      },
      {
        value: SortValue.PROPERTIES_ASC,
        id: 'sortBy.ascendingNumberOfProperty',
      },
      { value: SortValue.UPLOAD_AT_DESC, id: 'sortBy.descendingDateUploaded' },
      { value: SortValue.UPLOAD_AT_ASC, id: 'sortBy.ascendingDateUploaded' },
    ]
  }
}

export const PUBLIC_DATA_SET_SIZE_PER_PAGE = 15

export namespace Color {
  export const MAIN = '#40b9c4'
  export const GRAY_CCC = '#ccc'
}

// msを基点として
export const PERIOD_10_SECONDS = 10 * 1000

export const ADMIN_DATA_SET_SIZE_PER_PAGE = 50

export const MAX_RETRY_COUNT = 3
