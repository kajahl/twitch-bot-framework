/*

Dekorator do definiowania klas jako instancje serwisów per instancja bota (singleton per bot - np.: TokenService, RateLimiter)
Działa podobnie jak @Service, ale tworzy instancje serwisu dla każdego bota osobno

Przykład użycia:

@InstanceService()

*/

import 'reflect-metadata';
import Container from 'typedi';
import { ITwitchBotConfig } from './TwitchBot.decorator';

// Typy

interface IInstanceServiceConfig {}

// Funkcje

export const ServiceClassContainer = Container.of('InstanceService');

export function InstanceService(config: IInstanceServiceConfig = {}): ClassDecorator {
    return (target: Function) => {
        console.log(`[InstanceServiceDecorator] Registering service class for ${target.name}`);
        ServiceClassContainer.set(target.name, target);
    };
}

export const ServicePerInstanceContainer = Container.of('ServicePerInstance');
export const getInstanceId = (target: Function, userId: string) => `${target.name}_${userId}`;

export function RegisterServicePerInstance(botInstance: Function, target: Function): void {
    const botInstanceConfig = Reflect.getMetadata('config', botInstance) as ITwitchBotConfig;
    const userId = botInstanceConfig.userId;
    const instanceId = getInstanceId(target, userId);

    // Get class for target
    const serviceClass = ServiceClassContainer.get(target.name) as new (...args: any[]) => any;
    if(!serviceClass) throw new Error(`Service class not found for ${target.name} - did you forget to add @InstanceService() decorator?`);

    console.log(`[InstanceServiceDecorator] Registering service ${instanceId} per instance ${userId} for ${target.name}`);
    ServicePerInstanceContainer.set(instanceId, new serviceClass(botInstance));
}

export function getServiceInstance<T>(target: Function, userId: string): T {
    const instanceId = getInstanceId(target, userId);
    const instance = ServicePerInstanceContainer.get(instanceId) as T;
    if (!instance) throw new Error(`Service instance ${instanceId} not found per instance ${userId}`);
    return instance;
}

