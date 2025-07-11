/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumberish,
  BytesLike,
  FunctionFragment,
  Result,
  Interface,
  EventFragment,
  AddressLike,
  ContractRunner,
  ContractMethod,
  Listener,
} from "ethers";
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedLogDescription,
  TypedListener,
  TypedContractMethod,
} from "./common";

export interface EmployerLogicInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "allFreelancerAddresses"
      | "createJob"
      | "depositFunds"
      | "employers"
      | "escrowFunds"
      | "freelancers"
      | "jobs"
      | "owner"
      | "registerEmployer"
      | "releaseEscrow"
      | "roles"
      | "totalCompletedJobs"
      | "totalEmployers"
      | "totalFreelancers"
      | "totalJobs"
  ): FunctionFragment;

  getEvent(
    nameOrSignatureOrTopic:
      | "EmployerRegistered"
      | "FundsDeposited"
      | "FundsReleased"
      | "JobCreated"
  ): EventFragment;

  encodeFunctionData(
    functionFragment: "allFreelancerAddresses",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "createJob",
    values: [string, string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "depositFunds",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "employers",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "escrowFunds",
    values: [AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "freelancers",
    values: [AddressLike]
  ): string;
  encodeFunctionData(functionFragment: "jobs", values: [BigNumberish]): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "registerEmployer",
    values: [string, string, string, string]
  ): string;
  encodeFunctionData(
    functionFragment: "releaseEscrow",
    values: [BigNumberish, AddressLike]
  ): string;
  encodeFunctionData(functionFragment: "roles", values: [AddressLike]): string;
  encodeFunctionData(
    functionFragment: "totalCompletedJobs",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "totalEmployers",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "totalFreelancers",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "totalJobs", values?: undefined): string;

  decodeFunctionResult(
    functionFragment: "allFreelancerAddresses",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "createJob", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "depositFunds",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "employers", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "escrowFunds",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "freelancers",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "jobs", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "registerEmployer",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "releaseEscrow",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "roles", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "totalCompletedJobs",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "totalEmployers",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "totalFreelancers",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "totalJobs", data: BytesLike): Result;
}

export namespace EmployerRegisteredEvent {
  export type InputTuple = [employerAddress: AddressLike, name: string];
  export type OutputTuple = [employerAddress: string, name: string];
  export interface OutputObject {
    employerAddress: string;
    name: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace FundsDepositedEvent {
  export type InputTuple = [
    jobId: BigNumberish,
    sender: AddressLike,
    amount: BigNumberish
  ];
  export type OutputTuple = [jobId: bigint, sender: string, amount: bigint];
  export interface OutputObject {
    jobId: bigint;
    sender: string;
    amount: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace FundsReleasedEvent {
  export type InputTuple = [
    jobId: BigNumberish,
    freelancerAddress: AddressLike,
    amount: BigNumberish
  ];
  export type OutputTuple = [
    jobId: bigint,
    freelancerAddress: string,
    amount: bigint
  ];
  export interface OutputObject {
    jobId: bigint;
    freelancerAddress: string;
    amount: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace JobCreatedEvent {
  export type InputTuple = [jobId: BigNumberish, title: string];
  export type OutputTuple = [jobId: bigint, title: string];
  export interface OutputObject {
    jobId: bigint;
    title: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface EmployerLogic extends BaseContract {
  connect(runner?: ContractRunner | null): EmployerLogic;
  waitForDeployment(): Promise<this>;

  interface: EmployerLogicInterface;

  queryFilter<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;
  queryFilter<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;

  on<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  on<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  once<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  once<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  listeners<TCEvent extends TypedContractEvent>(
    event: TCEvent
  ): Promise<Array<TypedListener<TCEvent>>>;
  listeners(eventName?: string): Promise<Array<Listener>>;
  removeAllListeners<TCEvent extends TypedContractEvent>(
    event?: TCEvent
  ): Promise<this>;

  allFreelancerAddresses: TypedContractMethod<
    [arg0: BigNumberish],
    [string],
    "view"
  >;

  createJob: TypedContractMethod<
    [_title: string, _description: string, _budget: BigNumberish],
    [void],
    "nonpayable"
  >;

  depositFunds: TypedContractMethod<[jobId: BigNumberish], [void], "payable">;

  employers: TypedContractMethod<
    [arg0: AddressLike],
    [
      [string, string, string, bigint, string, string, boolean, bigint] & {
        employerAddress: string;
        name: string;
        industry: string;
        balance: bigint;
        country: string;
        image: string;
        registered: boolean;
        registration_date: bigint;
      }
    ],
    "view"
  >;

  escrowFunds: TypedContractMethod<
    [arg0: AddressLike, arg1: BigNumberish],
    [bigint],
    "view"
  >;

  freelancers: TypedContractMethod<
    [arg0: AddressLike],
    [
      [
        string,
        string,
        string,
        bigint,
        string,
        string,
        string,
        bigint,
        boolean,
        bigint,
        bigint
      ] & {
        freelancerAddress: string;
        name: string;
        skills: string;
        balance: bigint;
        country: string;
        gigTitle: string;
        gitDescription: string;
        jobsCompleted: bigint;
        registered: boolean;
        registration_date: bigint;
        starting_price: bigint;
      }
    ],
    "view"
  >;

  jobs: TypedContractMethod<
    [arg0: BigNumberish],
    [
      [bigint, string, string, string, bigint, boolean, string] & {
        id: bigint;
        employer: string;
        title: string;
        description: string;
        budget: bigint;
        completed: boolean;
        hiredFreelancer: string;
      }
    ],
    "view"
  >;

  owner: TypedContractMethod<[], [string], "view">;

  registerEmployer: TypedContractMethod<
    [_name: string, _industry: string, _country: string, _imageURI: string],
    [void],
    "nonpayable"
  >;

  releaseEscrow: TypedContractMethod<
    [jobId: BigNumberish, freelancerAddress: AddressLike],
    [void],
    "nonpayable"
  >;

  roles: TypedContractMethod<[arg0: AddressLike], [bigint], "view">;

  totalCompletedJobs: TypedContractMethod<[], [bigint], "view">;

  totalEmployers: TypedContractMethod<[], [bigint], "view">;

  totalFreelancers: TypedContractMethod<[], [bigint], "view">;

  totalJobs: TypedContractMethod<[], [bigint], "view">;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "allFreelancerAddresses"
  ): TypedContractMethod<[arg0: BigNumberish], [string], "view">;
  getFunction(
    nameOrSignature: "createJob"
  ): TypedContractMethod<
    [_title: string, _description: string, _budget: BigNumberish],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "depositFunds"
  ): TypedContractMethod<[jobId: BigNumberish], [void], "payable">;
  getFunction(
    nameOrSignature: "employers"
  ): TypedContractMethod<
    [arg0: AddressLike],
    [
      [string, string, string, bigint, string, string, boolean, bigint] & {
        employerAddress: string;
        name: string;
        industry: string;
        balance: bigint;
        country: string;
        image: string;
        registered: boolean;
        registration_date: bigint;
      }
    ],
    "view"
  >;
  getFunction(
    nameOrSignature: "escrowFunds"
  ): TypedContractMethod<
    [arg0: AddressLike, arg1: BigNumberish],
    [bigint],
    "view"
  >;
  getFunction(
    nameOrSignature: "freelancers"
  ): TypedContractMethod<
    [arg0: AddressLike],
    [
      [
        string,
        string,
        string,
        bigint,
        string,
        string,
        string,
        bigint,
        boolean,
        bigint,
        bigint
      ] & {
        freelancerAddress: string;
        name: string;
        skills: string;
        balance: bigint;
        country: string;
        gigTitle: string;
        gitDescription: string;
        jobsCompleted: bigint;
        registered: boolean;
        registration_date: bigint;
        starting_price: bigint;
      }
    ],
    "view"
  >;
  getFunction(
    nameOrSignature: "jobs"
  ): TypedContractMethod<
    [arg0: BigNumberish],
    [
      [bigint, string, string, string, bigint, boolean, string] & {
        id: bigint;
        employer: string;
        title: string;
        description: string;
        budget: bigint;
        completed: boolean;
        hiredFreelancer: string;
      }
    ],
    "view"
  >;
  getFunction(
    nameOrSignature: "owner"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "registerEmployer"
  ): TypedContractMethod<
    [_name: string, _industry: string, _country: string, _imageURI: string],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "releaseEscrow"
  ): TypedContractMethod<
    [jobId: BigNumberish, freelancerAddress: AddressLike],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "roles"
  ): TypedContractMethod<[arg0: AddressLike], [bigint], "view">;
  getFunction(
    nameOrSignature: "totalCompletedJobs"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "totalEmployers"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "totalFreelancers"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "totalJobs"
  ): TypedContractMethod<[], [bigint], "view">;

  getEvent(
    key: "EmployerRegistered"
  ): TypedContractEvent<
    EmployerRegisteredEvent.InputTuple,
    EmployerRegisteredEvent.OutputTuple,
    EmployerRegisteredEvent.OutputObject
  >;
  getEvent(
    key: "FundsDeposited"
  ): TypedContractEvent<
    FundsDepositedEvent.InputTuple,
    FundsDepositedEvent.OutputTuple,
    FundsDepositedEvent.OutputObject
  >;
  getEvent(
    key: "FundsReleased"
  ): TypedContractEvent<
    FundsReleasedEvent.InputTuple,
    FundsReleasedEvent.OutputTuple,
    FundsReleasedEvent.OutputObject
  >;
  getEvent(
    key: "JobCreated"
  ): TypedContractEvent<
    JobCreatedEvent.InputTuple,
    JobCreatedEvent.OutputTuple,
    JobCreatedEvent.OutputObject
  >;

  filters: {
    "EmployerRegistered(address,string)": TypedContractEvent<
      EmployerRegisteredEvent.InputTuple,
      EmployerRegisteredEvent.OutputTuple,
      EmployerRegisteredEvent.OutputObject
    >;
    EmployerRegistered: TypedContractEvent<
      EmployerRegisteredEvent.InputTuple,
      EmployerRegisteredEvent.OutputTuple,
      EmployerRegisteredEvent.OutputObject
    >;

    "FundsDeposited(uint256,address,uint256)": TypedContractEvent<
      FundsDepositedEvent.InputTuple,
      FundsDepositedEvent.OutputTuple,
      FundsDepositedEvent.OutputObject
    >;
    FundsDeposited: TypedContractEvent<
      FundsDepositedEvent.InputTuple,
      FundsDepositedEvent.OutputTuple,
      FundsDepositedEvent.OutputObject
    >;

    "FundsReleased(uint256,address,uint256)": TypedContractEvent<
      FundsReleasedEvent.InputTuple,
      FundsReleasedEvent.OutputTuple,
      FundsReleasedEvent.OutputObject
    >;
    FundsReleased: TypedContractEvent<
      FundsReleasedEvent.InputTuple,
      FundsReleasedEvent.OutputTuple,
      FundsReleasedEvent.OutputObject
    >;

    "JobCreated(uint256,string)": TypedContractEvent<
      JobCreatedEvent.InputTuple,
      JobCreatedEvent.OutputTuple,
      JobCreatedEvent.OutputObject
    >;
    JobCreated: TypedContractEvent<
      JobCreatedEvent.InputTuple,
      JobCreatedEvent.OutputTuple,
      JobCreatedEvent.OutputObject
    >;
  };
}
