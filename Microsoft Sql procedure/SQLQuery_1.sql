CREATE PROCEDURE GetProjectStats
    @ProjectId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Переменные для результатов
    DECLARE @TotalProductCount DECIMAL(19,6) = 0;
    DECLARE @DeliveredProductCount DECIMAL(19,6) = 0;
    DECLARE @TotalAmount DECIMAL(19,6) = 0;
    DECLARE @TotalSpent DECIMAL(19,6) = 0;
    DECLARE @ProjectCurrencyId INT;
    
    -- Получаем валюту проекта
    SELECT @ProjectCurrencyId = currencyId 
    FROM Projects 
    WHERE id = @ProjectId;
    
    IF @ProjectCurrencyId IS NULL
    BEGIN
        RAISERROR('Project not found', 16, 1);
        RETURN;
    END
    
    -- 1. Сумма всех товаров по контрактам проекта
    SELECT @TotalProductCount = ISNULL(SUM(pi.contractQuantity), 0)
    FROM product_inventories pi
    INNER JOIN Contracts c ON pi.contractId = c.id
    WHERE c.projectId = @ProjectId;
    
    -- 2. Сумма полученных товаров
    SELECT @DeliveredProductCount = ISNULL(SUM(pi.takeQuantity), 0)
    FROM product_inventories pi
    INNER JOIN Contracts c ON pi.contractId = c.id
    WHERE c.projectId = @ProjectId;
    
    -- 3. Общая сумма контрактов в валюте проекта
    SELECT @TotalAmount = ISNULL(SUM(
        CASE 
            WHEN c.currencyId = @ProjectCurrencyId THEN c.amount
            ELSE c.amount * ISNULL(c.projectCurrencyExchangeRate, 0)
        END
    ), 0)
    FROM Contracts c
    WHERE c.projectId = @ProjectId;
    
    -- 4. Всего потрачено (учтены issued и refund платежи)
    -- SELECT @TotalSpent = ISNULL(SUM(
    --     CASE 
    --         WHEN cph.type = 'issued' THEN cph.amount
    --         WHEN cph.type = 'refund' THEN -cph.amount
    --         ELSE 0
    --     END
    -- ), 0)
    -- FROM contract_payment_histories cph
    -- INNER JOIN Contracts c ON cph.contractId = c.id
    -- WHERE c.projectId = @ProjectId AND cph.type IN ('issued', 'refund');

     SELECT @TotalSpent = ISNULL(SUM(
        CASE 
            WHEN c.currencyId = @ProjectCurrencyId THEN c.giveAmount
            ELSE c.giveAmount * ISNULL(c.projectCurrencyExchangeRate, 0)
        END
    ), 0)
    FROM Contracts c
    WHERE c.projectId = @ProjectId;
  

    -- Возвращаем результаты
    SELECT 
        @TotalProductCount AS totalProductCount,
        @DeliveredProductCount AS deliveredProductCount,
        @TotalAmount AS totalAmount,
        @TotalSpent AS totalSpent;
END