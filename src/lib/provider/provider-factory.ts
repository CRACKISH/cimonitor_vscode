import { ProviderConfig, ProviderType } from '../config';
import { JenkinsProvider } from './jenkins-provider';
import { Provider } from './provider';
import { TeamCityProvider } from './teamcity-provider';

export class ProviderFactory {
    public static create(config: ProviderConfig): Provider {
        const type = config.type;
        switch(type) {
            case ProviderType.jenkins: 
                return new JenkinsProvider(config);
            case ProviderType.teamCity: 
                return new TeamCityProvider(config);
            default: 
                throw new Error(`Not supported type: ${type}`);
        }
    }
}