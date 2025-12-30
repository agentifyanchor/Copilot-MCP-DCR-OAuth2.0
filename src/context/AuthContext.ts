// Interface for authentication context
export interface IAuthContext {
    token?: string;
}

// For stateless servers, we can use a simple current context
class StatelessAuthContext {
    #currentAuthContext: IAuthContext | undefined = undefined;

    setAuthContext = (context: IAuthContext) => {
        this.#currentAuthContext = context;
    }

    getAuthContext = (): IAuthContext | undefined => {
        return this.#currentAuthContext;
    }

    clearAuthContext = () => {
        this.#currentAuthContext = undefined;
    }
}

export const authContext = {
    Stateless: new StatelessAuthContext()
};
